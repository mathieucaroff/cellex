import { DiffMode } from "../diffType"
import { Conceiver } from "../engineType"
import { BorderGroup, SideBorder, StochasticState, TopBorder } from "../patternlang/BorderType"
import { TopologyFinite } from "../topologyType"
import { clone } from "../util/clone"
import { mod } from "../util/mod"
import { PerfectRandom, RandomMapper } from "./RandomMapper"
import { earliestDifference } from "./diffmode/earliestDifference"

const SNAPSHOT_PERIOD = 400

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
// automaton, topology, and source of randomness
export let createAutomatonEngine = (
  conceiver: Conceiver,
  topology: TopologyFinite,
  randomMapper: RandomMapper,
) => {
  let left = -Math.floor(topology.width / 2)
  let genesis = Uint8Array.from({ length: topology.width }, (_, k) => {
    return getTopBorderValue(topology.genesis, k + left, randomMapper.top)
  })

  let currentT = 0
  let lineA = new Uint8Array(genesis) // current
  let lineB = Uint8Array.from({ length: genesis.length }) // previous
  let lineC = Uint8Array.from({ length: genesis.length }) // one-before-previous
  let snapshotArray: Uint8Array[] = [lineA]

  let diffMode: DiffMode = {
    status: "off",
    active: false,
  }

  // reset sets the engine current time and current line to the closest
  // snapshot available taken before the target time.
  let reset = (targetTime: number) => {
    if (currentT < targetTime) {
      // we cannot reset the time to a future time, only a past time
      // (we keep only the oldest of the two times)
      return
    }
    let arrayIndex = Math.floor(targetTime / SNAPSHOT_PERIOD)
    currentT = SNAPSHOT_PERIOD * arrayIndex
    lineA = snapshotArray[arrayIndex]
  }

  reset(0)

  let me = {
    setDiffMode: (newDiffMode: DiffMode) => {
      if (!newDiffMode.active) {
        // becoming inactive or staying inactive
        // nothing to do
      } else if (diffMode.active) {
        // staying active
        reset(earliestDifference(diffMode.changes, newDiffMode.changes))
      } else {
        // becoming active
        reset(newDiffMode.changes[0].t)
      }

      diffMode = clone(newDiffMode)
    },
    getLine: (t: number): Uint8Array => {
      if (t < currentT) {
        if (t < 0) {
          return Uint8Array.from({ length: topology.width })
        } else if (t >= 0) {
          reset(t)
        }
      }
      while (currentT < t) {
        // save lineA if currentT is a multiple of SNAPSHOT_PERIOD
        // also save lineD if the diffMode status wants it
        if (currentT % SNAPSHOT_PERIOD === 0) {
          let arrayIndex = Math.floor(currentT / SNAPSHOT_PERIOD)
          snapshotArray[arrayIndex] = new Uint8Array(lineA)
        }

        // [here lineA is the current line]
        // the input is line A and line C is the output
        conceiver.conceive(lineA, lineB, lineC, currentT)
        // increase time
        currentT += 1
        // rotate the three lines by name
        ;[lineB, lineC, lineA] = [lineA, lineB, lineC]
        // [now lineA is the current line again]
      }

      return lineA
    },
  }

  return me
}

export type Engine = ReturnType<typeof createAutomatonEngine>
