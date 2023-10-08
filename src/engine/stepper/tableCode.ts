import { TableCodeAutomaton } from "../../automatonType"
import { Stepper } from "../../engineType"
import { TopologyFinite } from "../../topologyType"
import { getSideBorderValue } from "../borderGetter"
import { RandomMapper } from "../misc/RandomMapper"

/** a stepper implementation for table codes */
export function createTableCodeStepper(
  code: TableCodeAutomaton,
  topology: TopologyFinite,
  randomMapper: RandomMapper,
): Stepper {
  let tableLength = 1 + (code.stateCount - 1) * code.neighborhoodSize
  if (tableLength > 4096) {
    throw `code table length too big (1 + (code.stateCount - 1) * code.neighborhoodSize) is (${tableLength}), which is larger than the limit, 4096`
  } else if (code.stateCount < 1) {
    throw `state count must be at least 1`
  }

  let neighborhoodMiddle = Math.floor(code.neighborhoodSize / 2)

  let functionLength = code.transitionTable.length

  let step = (input: Uint8Array, olderInput: Uint8Array, output: Uint8Array, currentT: number) => {
    // initialize the rolling result of the rule
    let neighborhoodRoll = Array.from({ length: code.neighborhoodSize }, () => 0)
    let rollIndex = 0
    let total = 0
    for (let k = -neighborhoodMiddle; k < 0; k++) {
      let value = 0
      if (topology.kind === "loop") {
        // look on the other side: `lineA[topology.width + k]`
        value = input[topology.width + k]
      } else if (topology.kind === "border") {
        // read the border
        value = getSideBorderValue(topology.borderLeft, currentT, randomMapper.left)
      }

      total += value
      neighborhoodRoll[rollIndex] = value
      rollIndex += 1
    }
    for (let k = 0; k < neighborhoodMiddle; k++) {
      total += input[k]
      neighborhoodRoll[rollIndex] = input[k]
      rollIndex += 1
    }

    // assert the rollIndex value to have exceeded its maximum legal value by one:
    if (rollIndex !== code.neighborhoodSize - 1) {
      throw new Error(`internal unexpected rolling index value: ${rollIndex}`)
    }

    // main loop
    for (let k = 0; k + neighborhoodMiddle < topology.width; k++) {
      let value = input[k + neighborhoodMiddle]
      total += value - neighborhoodRoll[rollIndex]
      neighborhoodRoll[rollIndex] = value
      rollIndex = (rollIndex + 1) % code.neighborhoodSize
      output[k] = code.transitionTable[functionLength - 1 - total]
      if (code.reversible) {
        output[k] ^= olderInput[k]
      }
    }

    // compute the last few values
    for (let k = topology.width - neighborhoodMiddle; k < topology.width; k++) {
      let value = 0
      if (topology.kind === "loop") {
        // look on the other side: `lineA[k - (topology.width - neighborhoodMiddle)]`
        value = input[k - (topology.width - neighborhoodMiddle)]
      } else {
        value = getSideBorderValue(topology.borderRight, currentT, randomMapper.right)
      }

      total += value - neighborhoodRoll[rollIndex]
      neighborhoodRoll[rollIndex] = value
      rollIndex = (rollIndex + 1) % code.neighborhoodSize
      output[k] = code.transitionTable[functionLength - 1 - total]
      if (code.reversible) {
        output[k] ^= olderInput[k]
      }
    }

    return output
  }

  return { step }
}
