import { testUnit } from "../devlib/testUnit"
import { Rule } from "../ruleType"
import { parseNomenclature } from "./nomenclature"

let { success, failure } = testUnit<string, Rule>((input: string) => {
  return parseNomenclature(input)
})

function elementaryRule(ruleNumber: number): Rule {
  return {
    dimension: 1,
    neighborhoodSize: 3,
    stateCount: 2,
    transitionFunction: Array.from({ length: 8 }, (_, k) => 1 & (ruleNumber >> (7 - k))),
  }
}

function rule0(neighborhoodSize: number, stateCount: number): Rule {
  return {
    dimension: 1,
    neighborhoodSize,
    stateCount,
    transitionFunction: Array.from({ length: stateCount ** neighborhoodSize }, (_, k) => 0),
  }
}

success("e0", elementaryRule(0))
success("e0000", elementaryRule(0))
success("e0255", elementaryRule(255))
success("1c,r0", rule0(3, 1))
success("2c,r0", rule0(3, 2))
success("3c,r0", rule0(3, 3))
success("4c,r0", rule0(3, 4))
success("5c,r0", rule0(3, 5))
success("6c,r0", rule0(3, 6))

success("ns1,r0", rule0(1, 2))
success("ns3,r0", rule0(3, 2))
success("ns5,r0", rule0(5, 2))

success("ns1,2c,r0", rule0(1, 2))
success("ns3,2c,r0", rule0(3, 2))
success("ns5,2c,r0", rule0(5, 2))

success("ns1,6c,r0", rule0(1, 6))
success("ns3,5c,r0", rule0(3, 5))
success("ns5,4c,r0", rule0(5, 4))

success("1d,ns3,5c,r0", rule0(3, 5))
success("2d,ns3,5c,r0", { ...rule0(3, 5), dimension: 2 })

success("0", elementaryRule(0))
success("255", elementaryRule(255))
success("256", {
  ...rule0(3, 3),
  // 256 == 3 ** 5 + 3 ** 2 + 3 ** 1 + 3 ** 0
  // prettier-ignore
  transitionFunction: [
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 1, 0, 0, 1, 1, 1,
    ],
})

success("ns11,r0", rule0(11, 2))

failure("e256")

failure("0c,r0")
