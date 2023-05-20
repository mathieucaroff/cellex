import { colorComplement, leftRightSymmetric } from "../engine/rule"
import { presentNomenclature } from "../nomenclature/nomenclature"
import { Rule } from "../ruleType"
import { useStateSelection } from "./hooks"

export const informationSet: Record<string, string> = {
  e30: "is famous for its use in artistic projects and as a source of chaos to generate randomness in some Wolfram products.",
  e54: "is of Class 4. It is thought to be Turing Complete, though this remains to be proven.",
  e60: "ignores the value to the right of the cell and XOR-s the value of the cell with the one to its left. It is like it computes a tilted cellular automaton with a neighborhood size of two.",
  e90: "ignores the current value of the cell and set it to the result of XOR-ing the cell to the left and the cell to the right. Because it ignores its own value, it is like there are two distinct cellular automaton with a neighborhood size of two being computed in parallel.",
  e105: "computes the negation of the result of XOR-ing all three cells. Rule 105 is like Rule 150, but twinkling.",
  e106: "is of Class 4. It is thought to be Turing Complete, though this remains to be proven.",
  e110: "is of Class 4 and it proven to be Turing Complete.",
  e150: "computes the result of XOR-ing all three cells.",
  e184: "is famous for being a simple simulation of objects moving to the right whenever there is room for them.",
  // primary rules
  e51: "is the negation rule. It swaps the state of each cell between alive and dead at each generation.",
  e170: "is the shift-left rule. The state of each cell is shifted by one at each generation.",
  e204: "is the identity rule. It leaves the world unchanged.",
}

interface Info {
  match: "exact" | "related"
  rule: string
  extra: string
}

export let getRuleInformation = (rule: Rule): Info | undefined => {
  if (rule.neighborhoodSize > 3 || rule.stateCount > 2) {
    return
  }
  let complement = colorComplement(rule)
  let alternativeArray = [
    rule,
    complement,
    leftRightSymmetric(rule),
    leftRightSymmetric(complement),
  ]

  for (let k = 0; k < alternativeArray.length; k++) {
    let name = presentNomenclature(alternativeArray[k]).descriptor
    let information = informationSet[name]
    if (information) {
      return {
        match: k < 1 ? "exact" : "related",
        rule: name,
        extra: information,
      }
    }
  }
  return
}

export let RuleInfo = () => {
  let rule = useStateSelection(({ rule }) => rule)
  let name = presentNomenclature(rule).longDescriptor
  let info = getRuleInformation(rule)!
  if (!info) {
    return <span></span>
  }
  if (info.match === "exact") {
    return (
      <span>
        Rule {name} {info.extra}
      </span>
    )
  } else {
    return (
      <>
        <span>
          Rule {name} is a symmetric of rule {info.rule} which {info.extra}
        </span>
      </>
    )
  }
}
