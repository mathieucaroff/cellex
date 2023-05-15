import { default as nearley } from "nearley"

import { computeTransitionFunction, computeTransitionNumber, thousandSplit } from "../engine/rule"
import { Rule } from "../type"
import nomenclatureGrammar from "./nomenclature.ne"

export function parseNomenclature(descriptor: string): Rule {
  let parser = new nearley.Parser(nomenclatureGrammar)

  try {
    parser.feed(descriptor)
  } catch (e) {
    let ne = new Error("invalid automaton descriptor (the grammar threw)")
    ne.message += String(e)
  }
  if (parser.results.length === 0) {
    throw new Error("invalid automaton descriptor (no results after parsing)")
  }

  let r:
    | string
    | {
        dimension?: [string]
        neighborhoodSize?: [string]
        colors?: [string]
        transitionString: [string]
      } = parser.results[0]

  // Manage the case where the rule descriptor contains no letter
  if (typeof r === "string") {
    let transitionNumber = BigInt(r)
    let stateCount = 0
    for (let k = 2n; k < 99n; k++) {
      if (k ** (k ** 3n) > transitionNumber) {
        stateCount = Number(k)
      }
    }
    if (stateCount === 0) {
      throw new Error("failed to obtain a big enough stateCount value")
    }

    return {
      dimension: 1,
      neighborhoodSize: 3,
      stateCount,
      transitionFunction: computeTransitionFunction(3, stateCount, BigInt(transitionNumber)),
    }
  }

  // The grammar guarantees that a transition number is specified
  let transition = BigInt(r.transitionString[0])

  let result: Rule = {
    dimension: +(r.dimension?.[0] ?? 1),
    neighborhoodSize: +(r.neighborhoodSize?.[0] ?? 3),
    stateCount: +(r.colors?.[0] ?? 2),
    transitionFunction: [],
  }
  result.transitionFunction = computeTransitionFunction(
    result.neighborhoodSize,
    result.stateCount,
    transition,
  )

  return result
}

export function presentNomenclature(rule: Rule) {
  let tn = thousandSplit(String(computeTransitionNumber(rule)))
  let regular: string[] = []
  let long: string[] = []
  if (rule.dimension !== 1) {
    regular.push(`${rule.dimension}d`)
    long.push(`${rule.dimension} dimensions`)
  }
  if (rule.neighborhoodSize !== 3) {
    regular.push(`ns${rule.neighborhoodSize}`)
    long.push(`neighborhood size ${rule.neighborhoodSize}`)
  }
  if (rule.stateCount !== 2) {
    regular.push(`${rule.stateCount}c`)
    long.push(`${rule.stateCount} colors`)
  }
  if (regular.length === 0) {
    regular.push(`e${tn}`)
    long.push(`elementary ${tn}`)
  } else {
    regular.push(`r${tn}`)
    long.push(`rule ${tn}`)
  }
  return {
    descriptor: regular.join(","),
    longDescriptor: long.join(", "),
  }
}

export function normalizeNomenclature(descriptor: string) {
  return presentNomenclature(parseNomenclature(descriptor)).descriptor
}
