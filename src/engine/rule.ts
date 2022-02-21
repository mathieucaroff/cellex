import { Rule } from "../type"
import { deepEqual } from "../util/deepEqual"

// elementaryRule produces a rule
export let elementaryRule = (ruleNumberValue: number): Rule => {
    let transitionFunction = Array.from({ length: 8 }, (_, k) => {
        return (ruleNumberValue & (1 << (7 - k))) >> (7 - k)
    })

    return {
        stateCount: 2,
        neighborhoodSize: 3,
        transitionFunction,
    }
}

// ternaryRule produces a rule whose state count is 3
export let ternaryRule = (transitionNumber?: number | bigint): Rule => {
    return nAryRule(3, transitionNumber)
}

// quaternaryRule produces a rule whose state count is 4
export let quaternaryRule = (transitionNumber?: number | bigint): Rule => {
    return nAryRule(4, transitionNumber)
}

// pentenaryRule produces a rule whose state count is 5
export let pentenaryRule = (transitionNumber?: number | bigint): Rule => {
    return nAryRule(5, transitionNumber)
}

// hexaryRule produces a rule whose state count is 6
export let hexaryRule = (transitionNumber?: number | bigint): Rule => {
    return nAryRule(6, transitionNumber)
}

// randomNAryRule produces a random rule whose state count is given or randomly
// taken between 2 and 6 inclusive and whose neighborhood size is 3.
export let nAryRule = (stateCount?: number, transitionNumber?: number | bigint): Rule => {
    let colorCount
    if (!stateCount) {
        stateCount = 2 + Math.floor(5 * Math.random() * Math.random())
        colorCount = BigInt(stateCount)
    } else {
        colorCount = BigInt(stateCount)
    }

    if (transitionNumber !== undefined) {
        // use the provided transitionNumber
        let transition = BigInt(transitionNumber)
        var transitionFunction = Array.from({ length: stateCount ** 3 }, (_, k) => {
            let mod = transition % colorCount
            transition = (transition - mod) / colorCount
            if (mod > 6) {
                throw "mod > 6"
            }
            return Number(mod)
        }).reverse()
    } else {
        // use random values
        transitionFunction = Array.from({ length: stateCount ** 3 }, (_, k) => {
            return Math.floor(Number(colorCount) * Math.random())
        })
    }

    return {
        stateCount: Number(colorCount),
        neighborhoodSize: 3,
        transitionFunction,
    }
}

// thousandSplit add billion markers (__) and thousand markers (_)
let thousandSplit = (integer: string) => {
    let reverse = integer.split("").reverse().join("")
    reverse = reverse.replace(/([0-9]{9})/g, "$1_")
    reverse = reverse.replace(/([0-9]{3})/g, "$1_")
    reverse = reverse.replace(/_+$/, "")
    return reverse.split("").reverse().join("")
}

export let ruleNumber = (rule: Rule): BigInt => {
    let value = 0n // bigint
    let stateCount = BigInt(rule.stateCount)
    rule.transitionFunction.forEach((v) => {
        value += BigInt(v)
        value *= stateCount
    })
    value /= stateCount
    return value
}

// ruleName gives a unique string name to a rule
export let ruleName = (rule: Rule): string => {
    if (rule.stateCount > 6) {
        throw "rule naming is limited to 6 states"
    }
    if (rule.neighborhoodSize != 3) {
        throw "rule naming is limited to neighborhood of size 3"
    }
    let letter = "__btqph"[rule.stateCount]
    let value = ruleNumber(rule)
    return `${letter}${thousandSplit("" + value)}`
}

export let parseRule = (input: string): Rule => {
    if (input.match(/^[btqph][_0-9]+$/)) {
        let value = input.replace(/_/g, "")
        return nAryRule("__btqph".indexOf(value[0]), BigInt(value.slice(1)))
    } else if (input.match(/^[0-9]+$/)) {
        return nAryRule(2, BigInt(input))
    } else if (input.match(/^[btqph]r(a(n(d(om?)?)?)?)?/)) {
        if (input.slice(1) === "random") {
            return nAryRule("__btqph".indexOf(input[0]))
        } else {
            return nAryRule(2, 0)
        }
    } else if (input.match(/^$|^r(a(n(d(om?)?)?)?)?$/)) {
        if (input === "random") {
            return nAryRule()
        } else {
            return nAryRule(2, 0)
        }
    } else {
        throw "unrecognized input"
    }
}

// leftRightSymmetric of the given rule
export let leftRightSymmetric = (rule: Rule): Rule => {
    return {
        ...rule,
        transitionFunction: rule.transitionFunction.map((_, k) => {
            let text = k.toString(rule.stateCount).padStart(rule.neighborhoodSize, "0")
            return rule.transitionFunction[
                parseInt(text.split("").reverse().join(""), rule.stateCount)
            ]
        }),
    }
}

// colorComplement of the given rule
export let colorComplement = (rule: Rule): Rule => {
    return {
        ...rule,
        transitionFunction: rule.transitionFunction.map((c) => rule.stateCount - 1 - c).reverse(),
    }
}

// Generate the elementary automata rule set, classifying each of them according to their symmetries
let generateRuleSet = () => {
    let ruleSet = {
        both: [] as number[],
        color: [] as number[][],
        leftright: [] as number[][],
        four: [] as number[][],
    }

    Array.from({ length: 256 }, (_, value) => {
        let rule = elementaryRule(value)

        let complementRule = colorComplement(rule)
        let complement = Number(ruleNumber(complementRule))
        let symmetric = Number(ruleNumber(leftRightSymmetric(rule)))
        let both = Number(ruleNumber(leftRightSymmetric(complementRule)))

        if (value === symmetric && value === complement) {
            ruleSet.both.push(value)
        } else if (value === complement && value !== symmetric) {
            if (value < symmetric) {
                ruleSet.leftright.push([value, symmetric])
            }
        } else if (value !== complement && value === symmetric) {
            if (value < complement) {
                ruleSet.color.push([value, complement])
            }
        } else {
            if (value < complement && value < symmetric && value < both) {
                ruleSet.four.push([value, symmetric, complement, both])
            }
        }
    })

    return ruleSet
}

export const ruleSet = generateRuleSet()
