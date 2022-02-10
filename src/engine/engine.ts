import { SideBorderDescriptor, StochasticState, TopBorderDescriptor } from "../borderType"
import { TopologyFinite } from "../topologyType"
import { Rule } from "../type"
import { modGet } from "../util/mod"
import { PerfectRandom, RandomMapper } from "./randomMapper"

let getTopBorderValue = (border: TopBorderDescriptor, x: number, random: PerfectRandom) => {
    let left = Math.floor(border.center.length / 2)
    let right = left + border.center.length
    if (left <= x && x < right) {
        var stochastic = border.center[x - left]
    } else if (x < left) {
        stochastic = modGet(border.cycleLeft, x - left)
    } else {
        // (x >= right)
        stochastic = modGet(border.cycleRight, x - right)
    }
    return runStochastique(stochastic, random(x, stochastic.total))
}

let getSideBorderValue = (border: SideBorderDescriptor, t: number, random: PerfectRandom) => {
    if (t < border.init.length) {
        var stochastic = border.init[t]
    } else {
        stochastic = border.cycle[(t - border.init.length) % border.cycle.length]
    }
    return runStochastique(stochastic, random(t, stochastic.total))
}

let runStochastique = (stochastic: StochasticState, value: number) => {
    let result = 0
    stochastic.cumulativeMap.some((v, k) => {
        result = k
        return v > value
    })
    return result
}

export let createAutomatonEngine = (
    rule: Rule,
    topology: TopologyFinite,
    randomMapper: RandomMapper,
) => {
    if (rule.stateCount > 16) {
        throw `state count must be at most 16 (got ${rule.stateCount})`
    } else if (rule.neighborhoodSize % 2 != 1) {
        throw `neighborhood size must be odd (got ${rule.neighborhoodSize})`
    } else if (rule.stateCount ** rule.neighborhoodSize > 4096) {
        throw `neighborhood too big (got ${rule.neighborhoodSize})`
    }

    let valuationArray = Array.from({ length: rule.neighborhoodSize }, (_, k) => {
        return rule.stateCount ** (rule.neighborhoodSize - 1 - k)
    })
    let neighborhoodMiddle = Math.floor(rule.neighborhoodSize / 2)
    let maxValuation = Math.max(...valuationArray)

    let currentT = 0
    let lineA = Uint8Array.from({ length: topology.width }) // known
    let lineB = Uint8Array.from({ length: topology.width }) // being computed

    // reset set lineA to genesis values
    let reset = () => {
        currentT = 0
        let left = -Math.floor(topology.width / 2)
        for (let k = 0; k < topology.width; k++) {
            let v = getTopBorderValue(topology.genesis, k + left, randomMapper.top)
            lineA[k] = v
        }
    }

    reset()

    let memory: Uint8Array[] = []
    let nextLine = () => {
        // initialize neighborhoodValue
        let neighborhoodValue = 0
        for (let k = -neighborhoodMiddle; k < 0; k++) {
            if (topology.kind == "loop") {
                // look on the other side: `lineA[topology.width + k]`
                neighborhoodValue +=
                    lineA[topology.width + k] * valuationArray[neighborhoodMiddle - k]
            } else if (topology.kind == "border") {
                // read the border
                var inc =
                    getSideBorderValue(topology.borderLeft, currentT, randomMapper.left) *
                    valuationArray[neighborhoodMiddle - k]
                neighborhoodValue += inc
            }
        }
        for (let k = 0; k <= neighborhoodMiddle; k++) {
            neighborhoodValue += lineA[k] * valuationArray[neighborhoodMiddle - k]
        }

        // main loop
        for (let k = 0; k + neighborhoodMiddle < topology.width; k++) {
            neighborhoodValue += lineA[k + neighborhoodMiddle]
            lineB[k] =
                rule.transitionFunction[rule.transitionFunction.length - 1 - neighborhoodValue]
            neighborhoodValue = (neighborhoodValue % maxValuation) * rule.stateCount
        }

        // compute the last few values
        for (let k = topology.width - neighborhoodMiddle; k < topology.width; k++) {
            neighborhoodValue = (neighborhoodValue % maxValuation) * rule.stateCount
            if (topology.kind == "loop") {
                // look on the other side: `lineA[topology.width + k]`
                neighborhoodValue += lineA[k - (topology.width - neighborhoodMiddle)]
            } else if (topology.kind == "border") {
                neighborhoodValue += getSideBorderValue(
                    topology.borderRight,
                    currentT,
                    randomMapper.right,
                )
                lineB[k] =
                    rule.transitionFunction[rule.transitionFunction.length - 1 - neighborhoodValue]
            }
        }

        // swap the two lines and increase time
        let oldLine = lineA
        lineA = lineB
        lineB = oldLine
        currentT += 1
    }

    return {
        getLine: (t: number): Uint8Array => {
            if (t < currentT) {
                if (t < 0) {
                    return Uint8Array.from({ length: topology.width })
                } else if (t >= 0) {
                    reset()
                }
            }
            while (currentT < t) {
                nextLine()
            }
            return lineA
        },
    }
}

export type Engine = ReturnType<typeof createAutomatonEngine>
