import { TableRuleAutomaton } from "../../automatonType"
import { Stepper } from "../../engineType"
import { TopologyFinite } from "../../topologyType"
import { getSideBorderValue } from "../borderGetter"
import { RandomMapper } from "../misc/RandomMapper"

/** table rule stepper */
export function createTableRuleStepper(
  rule: TableRuleAutomaton,
  topology: TopologyFinite,
  randomMapper: RandomMapper,
): Stepper {
  let tableLength = rule.stateCount ** rule.neighborhoodSize
  if (tableLength > 4096) {
    throw `rule table length too big (stateCount ** neighborhoodSize) is (${tableLength}), which is larger than the limit, 4096`
  } else if (rule.stateCount < 1) {
    throw `state count must be at least 1`
  }

  let neighborhoodMiddle = Math.floor(rule.neighborhoodSize / 2)
  let excessValue = rule.stateCount ** rule.neighborhoodSize

  let functionLength = rule.transitionTable.length

  let step = (input: Uint8Array, olderInput: Uint8Array, output: Uint8Array, currentT: number) => {
    // initialize the rolling result of the rule
    let index = 0
    for (let k = -neighborhoodMiddle; k < 0; k++) {
      index *= rule.stateCount
      if (topology.kind === "loop") {
        // look on the other side: `lineA[topology.width + k]`
        index += input[topology.width + k]
      } else if (topology.kind === "border") {
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
      output[k] = rule.transitionTable[functionLength - 1 - index]
      if (rule.reversible) {
        output[k] ^= olderInput[k]
      }
    }

    // compute the last few values
    for (let k = topology.width - neighborhoodMiddle; k < topology.width; k++) {
      index = (index * rule.stateCount) % excessValue
      if (topology.kind === "loop") {
        // look on the other side: `lineA[topology.width + k]`
        index += input[k - (topology.width - neighborhoodMiddle)]
      } else if (topology.kind === "border") {
        index += getSideBorderValue(topology.borderRight, currentT, randomMapper.right)
      }

      output[k] = rule.transitionTable[functionLength - 1 - index]
      if (rule.reversible) {
        output[k] ^= olderInput[k]
      }
    }

    return output
  }

  return { step }
}
