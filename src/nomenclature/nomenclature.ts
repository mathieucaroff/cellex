import { default as nearley } from "nearley"

import { computeTransitionFunction, thousandSplit } from "../engine/rule"
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

  let r: string | Partial<Rule> = parser.results[0]

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
      ...computeTransitionFunction(3, stateCount, BigInt(transitionNumber)),
    }
  }

  // The grammar guarantees that a transition number was specified
  let transition = BigInt(r.transitionNumber!)

  let result: Rule = {
    dimension: 1,
    neighborhoodSize: 3,
    stateCount: 2,
    ...r,
    ...computeTransitionFunction(r.neighborhoodSize ?? 3, r.stateCount ?? 2, transition),
  }

  return result
}

export function presentNomenclature(rule: Rule) {
  let tn = thousandSplit(String(rule.transitionNumber))
  return {
    descriptor: `ns${rule.neighborhoodSize},${rule.stateCount}c,r${tn}`,
    longDescriptor: `neighborhood size ${rule.neighborhoodSize}, ${rule.stateCount} colors, rule ${tn}`,
  }
}

export function normalizeNomenclature(descriptor: string) {
  return presentNomenclature(parseNomenclature(descriptor)).descriptor
}
