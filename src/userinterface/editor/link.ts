import { computeTransitionNumber } from "../../engine/rule"
import { TableRule } from "../../ruleType"

export let getMathworldLink = (ruleNumber: number) => {
  let knownRuleNumbers = [
    30, 50, 54, 60, 62, 90, 94, 102, 110, 126, 150, 158, 182, 188, 190, 220, 222,
  ]
  if (knownRuleNumbers.includes(ruleNumber)) {
    return `https://mathworld.wolfram.com/Rule${ruleNumber}.html`
  }
  return ""
}

export let getWikipediaLink = (ruleNumber: number) => {
  let knownRuleNumbers = [28, 50, 54, 60, 90, 94, 102, 110, 150, 158, 188, 190, 220, 222]
  if (knownRuleNumbers.includes(ruleNumber)) {
    return `https://en.wikipedia.org/wiki/Elementary_cellular_automaton#Rule_${ruleNumber}`
  }
  return ""
}

export let getWikipediaDedicatedPageLink = (ruleNumber: number) => {
  let knownRuleNumbers = [90, 110, 184]
  if (knownRuleNumbers.includes(ruleNumber)) {
    return `https://en.wikipedia.org/wiki/Rule_${ruleNumber}`
  }
  return ""
}

export let getWolframAlphaLink = (rule: TableRule) => {
  let prefix = "https://www.wolframalpha.com/input/?i="
  let r = fractionToString(rule.neighborhoodSize - 1, 2)
  let ruleNumber = computeTransitionNumber(rule)
  return `${prefix}k%3D${rule.stateCount}+r%3D${r}+rule+${ruleNumber}`
}

let fractionToString = (numerator: number, denominator: number) => {
  let g = gcd(numerator, denominator)
  let result = String(numerator / g)
  if (denominator > g) {
    result += `/${denominator / g}`
  }

  return result
}

let gcd = (a: number, b: number) => {
  a = Math.abs(a)
  b = Math.abs(b)
  if (b > a) {
    var temp = a
    a = b
    b = temp
  }
  while (true) {
    if (b == 0) return a
    a %= b
    if (a == 0) return b
    b %= a
  }
}
