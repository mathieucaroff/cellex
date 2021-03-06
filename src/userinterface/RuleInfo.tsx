import { useContext } from "react"
import { colorComplement, leftRightSymmetric, ruleName } from "../engine/rule"
import { ReactContext } from "../state/ReactContext"
import { Rule } from "../type"

export const informationSet: Record<string, string> = {
    b30: "is famous for its use in artistic projects and as a source of chaos to generate randomness in some Wolfram products",
    b54: "is of Class 4. It is thought to be Turing Complete, though this remains to be proven.",
    b60: "ignores the value to the right of the cell and XOR-s the value of the cell with the one to its left. It is like it computes a tilted cellular automaton with a neighboorhood size of two",
    b90: "ignores the current value of the cell and set it to the result of XOR-ing the cell to the left and the cell to the right. Because it ignores its own value, it is like there are two distinct cellular automaton with a neighboorhood size of two being computed in parallel.",
    b105: "computes the negation of the result XOR-ing all three cells. Rule 105 is like Rule 150, but twinkling.",
    b106: "is of Class 4. It is thought to be Turing Complete, though this remains to be proven.",
    b110: "is of Class 4 and it proven to be Turing Complete.",
    b150: "computes the result of XOR-ing all three cells.",
    b184: "is famous for being a simple simulation of objects moving to the right whenever there is room for them.",
    // primary rules
    b51: "is the negation rule. It swaps the state of each cell between alive and dead at each generation.",
    b170: "is the shift-left rule. The state of each cell is shifted by one at each generation.",
    b204: "is the identity rule. It leaves the world unchanged.",
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
        let name = ruleName(alternativeArray[k])
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
    let { context } = useContext(ReactContext)
    let { rule } = context.getState()
    let name = ruleName(rule)
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
            <span>
                Rule {name} is a symmetric of rule {info.rule} which {info.extra}
            </span>
        )
    }
}
