import { Rule } from "../type"

// elementaryRule produces a rule
export let elementaryRule = (ruleNumber: number): Rule => {
    let transitionFunction = Array.from({ length: 8 }, (_, k) => {
        return (ruleNumber & (1 << (7 - k))) >> (7 - k)
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
// taken between 2 and 6 inclusive.
export let nAryRule = (stateCount?: number, transitionNumber?: number | bigint): Rule => {
    let colorCount
    if (!stateCount) {
        stateCount = 2 + Math.floor(5 * Math.random())
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
    reverse = reverse.replace(/([0-9]{9})/g, "_$1")
    reverse = reverse.replace(/([0-9]{3})/g, "_$1")
    reverse = reverse.replace(/^_+/, "")
    return reverse.split("").reverse().join("")
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
    let value = 0n // bigint
    let stateCount = BigInt(rule.stateCount)
    rule.transitionFunction.forEach((v) => {
        value += BigInt(v)
        value *= stateCount
    })
    value /= stateCount
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
