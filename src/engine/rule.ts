import { Domain, Rule } from "../ruleType"
import { randomChoice, weightedRandomChoice } from "../util/randomChoice"

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

export let randomDomain = (): Domain => {
  let [neighborhoodSize, stateCount] = weightedRandomChoice([
    // weight, [neighborhoodSize, colorCount]
    [1, [3, 2]], // elementary automaton
    [1, [5, 2]],
    [1, [7, 2]],
    [1, [9, 2]],
    [1, [11, 2]],
    // [1, [12, 2]],
    [1, [3, 3]],
    [1, [5, 3]],
    [1, [7, 3]],
    [1, [3, 4]],
    [1, [5, 4]],
    [1, [3, 5]],
    [1, [5, 5]],
    [1, [3, 6]],
    // [1, [3, 7]],
    // [1, [3, 8]],
    // [1, [3, 9]],
    // [1, [3, 10]],
    // [1, [3, 11]],
    // [1, [3, 12]],
    // [1, [3, 13]],
    // [1, [3, 14]],
    // [1, [3, 15]],
    // [1, [3, 16]],
    // [1, [2, 16]],
    // ...
    // [1, [2, 64]],
  ])
  return { dimension: 1, neighborhoodSize, stateCount }
}

export let randomTransition = (domain: Omit<Domain, "dimension">) => {
  let { neighborhoodSize, stateCount } = domain
  let count = BigInt(stateCount)
  let transition = 0n
  let transitionFunction = Array.from({ length: stateCount ** neighborhoodSize }, () => {
    let random = Math.floor(stateCount * Math.random())
    transition *= count
    transition += BigInt(random)
    return random
  })
  // let transitionNumber = transition
  return {
    transitionFunction,
    transitionNumber: transition,
  }
}

export let randomRule = () => {
  return randomRuleFromDomain(randomDomain())
}

export let randomRuleFromDomain = (domain: Domain): Rule => {
  let { neighborhoodSize, stateCount } = domain
  return {
    dimension: 1,
    neighborhoodSize,
    stateCount,
    transitionFunction: randomTransition({ neighborhoodSize, stateCount }).transitionFunction,
  }
}

export let randomGoodRule = (): Rule => {
  if (Math.random() < 0.6) {
    return elementaryRule(randomChoice(interestingElementaryRuleArray))
  }
  return randomRule()
}

export let randomGoodRuleFromDomain = (domain: Domain): Rule => {
  if (domain.neighborhoodSize === 3 && domain.stateCount === 2 && Math.random() < 0.6) {
    return elementaryRule(randomChoice(interestingElementaryRuleArray))
  }
  return randomRuleFromDomain(domain)
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

export let baseComplement = (rule: Rule): Rule => {
  return {
    ...rule,
    transitionFunction: rule.transitionFunction.map((c) => rule.stateCount - 1 - c),
  }
}

export let baseDigitOrderReverse = (rule: Rule): Rule => {
  return {
    ...rule,
    transitionFunction: [...rule.transitionFunction].reverse(),
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
    fourA: [] as number[][],
    fourB: [] as number[][],
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
        ruleGroup.fourA.push(entry)
      } else {
        ruleGroup.fourB.push(entry)
      }
    }
  })

  return ruleGroup
}

export const ruleSet = generateRuleSet()
;(globalThis as any).ruleSet = ruleSet
;(globalThis as any).interestingElementaryRuleArray = interestingElementaryRuleArray
