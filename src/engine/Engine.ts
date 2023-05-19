import { DiffMode } from "../diffType"
import { BorderGroup, SideBorder, StochasticState, TopBorder } from "../patternlang/BorderType"
import { Rule } from "../ruleType"
import { TopologyFinite } from "../topologyType"
import { mod } from "../util/mod"
import { PerfectRandom, RandomMapper } from "./RandomMapper"

// getStochastic finds the stochastic associated with a position of a group
export let getStochastic = (group: BorderGroup, position: number): StochasticState => {
  // group.width is expected to always be a multiple of group.quantity
  position = position % (group.width / group.quantity)
  let border = group.content.find((border) => {
    position -= border.width
    if (position < 0) {
      position += border.width
      return true
    }
    return false
  })!
  if (border.type === "state") {
    return border
  } else {
    return getStochastic(border, position)
  }
}

// getTopBorderValue reads the possibly random value of the given position of the top border
export let getTopBorderValue = (border: TopBorder, x: number, random: PerfectRandom) => {
  let left = -Math.floor(border.center.width / 2)
  let right = left + border.center.width
  if (left <= x && x < right) {
    var stochastic = getStochastic(border.center, mod(x - left, border.center.width))
  } else if (x < left) {
    stochastic = getStochastic(border.cycleLeft, mod(x - left, border.cycleLeft.width))
  } else {
    // (x >= right)
    stochastic = getStochastic(border.cycleRight, mod(x - left, border.cycleRight.width))
  }
  return runStochastic(stochastic, random(x, stochastic.total))
}

// getSideBorderValue reads the possibly random value of the given time of a side border
export let getSideBorderValue = (border: SideBorder, t: number, random: PerfectRandom) => {
  if (t < border.init.width) {
    var stochastic = getStochastic(border.init, t)
  } else {
    stochastic = getStochastic(border.cycle, (t - border.init.width) % border.cycle.width)
  }
  return runStochastic(stochastic, random(t, stochastic.total))
}

// runStochastic determines the value of a random border by going through its cumulative map.
// The parameter `value` is expected to be a random value between 0 and the last cumulative map value.
export let runStochastic = (border: StochasticState, value: number) => {
  let result = 0
  border.cumulativeMap.some((v, k) => {
    result = k
    return v > value
  })
  return result
}

// createAutomatonEngine creates a 1d automaton computing machine for the given
// rule, topology, and source of randomness
export let createAutomatonEngine = (
  rule: Rule,
  topology: TopologyFinite,
  randomMapper: RandomMapper,
) => {
  let length = rule.stateCount ** rule.neighborhoodSize
  if (rule.stateCount > 16) {
    throw `state count must be at most 16 (got ${rule.stateCount})`
  } else if (rule.neighborhoodSize % 2 != 1) {
    throw `neighborhood size must be odd (got ${rule.neighborhoodSize})`
  } else if (length > 4096) {
    throw `rule length too big (stateCount ** neighborhoodSize) is (${length}, which is above 4096)`
  } else if (rule.stateCount < 1) {
    throw `state count must be at least 1`
  }

  let neighborhoodMiddle = Math.floor(rule.neighborhoodSize / 2)
  let excessValue = rule.stateCount ** rule.neighborhoodSize

  let currentT = 0
  let lineA = Uint8Array.from({ length: topology.width }) // known
  let lineB = Uint8Array.from({ length: topology.width }) // being computed

  // for diff mode
  let lineC = Uint8Array.from({ length: topology.width }) // known
  let lineD = Uint8Array.from({ length: topology.width }) // being computed

  let functionLength = rule.transitionFunction.length

  let diffMode: DiffMode = { status: "off" }

  let applyDiffModeChange = (line: Uint8Array, modifiedSet: number[]) => {
    return line.map((b, k) => {
      if (modifiedSet.includes(k)) {
        return (b + 1) % rule.stateCount
      }
      return b
    })
  }

  // reset set lineA to genesis values
  let reset = () => {
    currentT = 0
    let left = -Math.floor(topology.width / 2)
    for (let k = 0; k < topology.width; k++) {
      let v = getTopBorderValue(topology.genesis, k + left, randomMapper.top)
      lineB[k] = v
      lineD[k] = v
    }
  }

  reset()

  let nextLine = (input: Uint8Array, output: Uint8Array) => {
    // initialize the rolling result of the rule
    let index = 0
    for (let k = -neighborhoodMiddle; k < 0; k++) {
      index *= rule.stateCount
      if (topology.kind == "loop") {
        // look on the other side: `lineA[topology.width + k]`
        index += input[topology.width + k]
      } else if (topology.kind == "border") {
        // read the border
        index += getSideBorderValue(topology.borderLeft, currentT, randomMapper.left)
      }
    }
    for (let k = 0; k < neighborhoodMiddle; k++) {
      index *= rule.stateCount
      index += input[k]
    }

    // main loop
    for (let k = 0; k + neighborhoodMiddle < topology.width; k++) {
      index = (index * rule.stateCount) % excessValue
      index += input[k + neighborhoodMiddle]
      output[k] = rule.transitionFunction[functionLength - 1 - index]
    }

    // compute the last few values
    for (let k = topology.width - neighborhoodMiddle; k < topology.width; k++) {
      index = (index * rule.stateCount) % excessValue
      if (topology.kind == "loop") {
        // look on the other side: `lineA[topology.width + k]`
        index += input[k - (topology.width - neighborhoodMiddle)]
      } else if (topology.kind == "border") {
        index += getSideBorderValue(topology.borderRight, currentT, randomMapper.right)
      }

      output[k] = rule.transitionFunction[functionLength - 1 - index]
    }

    return output
  }

  let me = {
    setDiffMode: (otherDiffMode: DiffMode) => {
      diffMode = otherDiffMode
      reset()
    },
    getLine: (t: number): Uint8Array => {
      if (t < currentT) {
        if (t < 0) {
          return Uint8Array.from({ length: topology.width })
        } else if (t >= 0) {
          reset()
        }
      }
      while (currentT < t) {
        // increase time and swap the two lines
        currentT += 1

        let oldLine = lineA
        lineA = lineB
        lineB = oldLine

        // line A is known
        // line B is being computed
        nextLine(lineA, lineB)

        if (diffMode.status !== "off" && diffMode.status !== "waiting") {
          let oldLine = lineC
          lineC = lineD
          lineD = oldLine
          nextLine(lineC, lineD)
          if (diffMode.t === currentT) {
            let changeSet = diffMode.status === "selection" ? diffMode.s : [diffMode.s]
            lineD = applyDiffModeChange(lineD, changeSet)
          }
        }
      }

      if (diffMode.status !== "off" && diffMode.status !== "waiting") {
        if (diffMode.t === 0 && currentT === 0) {
          let changeSet = diffMode.status === "selection" ? diffMode.s : [diffMode.s]
          lineD = applyDiffModeChange(lineD, changeSet)
        }

        let { diffState } = diffMode
        let diffLine = lineB.map((b, k) => {
          return b === lineD[k] ? b : diffState
        })
        return diffLine
      }

      return lineB
    },
  }
  return me
}

export type Engine = ReturnType<typeof createAutomatonEngine>
