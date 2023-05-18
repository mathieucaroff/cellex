import { Rule } from "../type"
import { randomChoice } from "../util/randomChoice"

// prettier-ignore
export const interestingElementaryRuleSet = {
  "Famous":     [30, 90, 110, 184],
  "Class 4":    [54, 106, 110],
  "XOR":        [60, 90, 105, 150],
  "Triangle":   [18, 22, 26, 30, 122, 126, 146, 150, 154],
  "Primitives": [0, 255, 204, 51, 170, 240],
  "Twinkling":  [15, 41, 45, 51, 62, 73, 91, 94, 105],
}

let set = interestingElementaryRuleSet
export const interestingElementaryRuleArray = ([] as number[]).concat(
  set.Famous,
  set["Class 4"],
  set.XOR,
  set.Triangle,
  set.Twinkling.filter((x) => ![15, 51, 91, 94].includes(x)),
)

// elementaryRule produces a rule
export let elementaryRule = (ruleNumberValue: number): Rule => {
  let transitionFunction = Array.from({ length: 8 }, (_, k) => {
    return (ruleNumberValue & (1 << (7 - k))) >> (7 - k)
  })

  return {
    dimension: 1,
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
  let colorCount: bigint
  if (!stateCount) {
    stateCount = 2 + Math.floor(5 * Math.random() * Math.random())
    colorCount = BigInt(stateCount)
  } else {
    colorCount = BigInt(stateCount)
  }

  if (transitionNumber === undefined && stateCount === 2 && Math.random() < 0.67) {
    let s = interestingElementaryRuleSet
    transitionNumber = randomChoice(
      ([] as number[]).concat(s["Class 4"], s.Famous, s.Triangle, s.Twinkling, s.XOR),
    )
  }

  if (transitionNumber !== undefined) {
    // use the provided transitionNumber
    let transition = BigInt(transitionNumber)
    var transitionFunction = computeTransitionFunction(3, stateCount, transition)
  } else {
    // use random values
    let transition = 0n
    let count = Number(colorCount)
    transitionFunction = Array.from({ length: stateCount ** 3 }, () => {
      let random = Math.floor(count * Math.random())
      transition *= colorCount
      transition += BigInt(random)
      return random
    })
    transitionNumber = transition
  }

  return {
    dimension: 1,
    stateCount: Number(colorCount),
    neighborhoodSize: 3,
    transitionFunction,
  }
}

// thousandSplit add billion markers (__) and thousand markers (_)
export let thousandSplit = (integer: string) => {
  let reverse = integer.split("").reverse().join("")
  reverse = reverse.replace(/([0-9]{9})/g, "$1_")
  reverse = reverse.replace(/([0-9]{3})/g, "$1_")
  reverse = reverse.replace(/_+$/, "")
  return reverse.split("").reverse().join("")
}

export function computeTransitionFunction(
  neighborhoodSize: number,
  stateCount: number,
  transitionNumber: bigint,
) {
  let colorCount = BigInt(stateCount)

  let transitionFunction = Array.from({ length: stateCount ** neighborhoodSize }, () => {
    let mod = transitionNumber % colorCount
    transitionNumber = (transitionNumber - mod) / colorCount
    return Number(mod)
  }).reverse()

  return transitionFunction
}

export let computeTransitionNumber = (rule: Rule): BigInt => {
  let value = 0n // bigint
  let stateCount = BigInt(rule.stateCount)
  rule.transitionFunction.forEach((v) => {
    value += BigInt(v)
    value *= stateCount
  })
  value /= stateCount
  return value
}

// leftRightSymmetric of the given rule
export let leftRightSymmetric = (rule: Rule): Rule => {
  return {
    ...rule,
    transitionFunction: Array.from({ length: rule.transitionFunction.length }, (_, k) => {
      let text = k.toString(rule.stateCount).padStart(rule.neighborhoodSize, "0")
      let reversedText = text.split("").reverse().join("")
      let m = Number.parseInt(reversedText, rule.stateCount)
      return rule.transitionFunction[m]
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
  let ruleGroup = {
    both: [] as number[],
    color: [] as number[][],
    leftright: [] as number[][],
    leftrightcolor: [] as number[][],
    four: [] as number[][],
    four_a: [] as number[][],
    four_b: [] as number[][],
  }

  Array.from({ length: 256 }, (_, value) => {
    let rule = elementaryRule(value)

    let complementRule = colorComplement(rule)
    let complement = Number(computeTransitionNumber(complementRule))
    let symmetric = Number(computeTransitionNumber(leftRightSymmetric(rule)))
    let both = Number(computeTransitionNumber(leftRightSymmetric(complementRule)))

    if (value === symmetric && value === complement) {
      ruleGroup.both.push(value)
    } else if (value === complement && value !== symmetric) {
      if (value < symmetric) {
        ruleGroup.leftright.push([value, symmetric])
      }
    } else if (value !== complement && value === symmetric) {
      if (value < complement) {
        ruleGroup.color.push([value, complement])
      }
    } else if (value !== complement && value !== symmetric && value === both) {
      if (value < complement) {
        ruleGroup.leftrightcolor.push([value, complement])
      }
    } else if (value < complement && value < symmetric && value < both) {
      let entry = [value, symmetric, complement, both]
      ruleGroup.four.push(entry)
      if (value <= 42) {
        ruleGroup.four_a.push(entry)
      } else {
        ruleGroup.four_b.push(entry)
      }
    }
  })

  return ruleGroup
}

export const ruleSet = generateRuleSet()
;(window as any).ruleSet = ruleSet
