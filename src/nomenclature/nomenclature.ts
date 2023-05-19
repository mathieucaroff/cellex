import { default as nearley } from "nearley"

import { computeTransitionFunction, computeTransitionNumber, thousandSplit } from "../engine/rule"
import { Rule } from "../type"
import nomenclatureGrammar from "./nomenclature.ne"

type NomenclatureOutput =
  | ["numeric", string]
  | ["elementary", string]
  | [
      "any",
      {
        dimension?: [string]
        neighborhoodSize?: [string]
        colors?: [string]
        transitionString: [string]
      },
    ]

export function parseNomenclature(descriptor: string): Rule {
  let parser = new nearley.Parser(nomenclatureGrammar)

  try {
    parser.feed(descriptor)
  } catch (e) {
    let ne = new Error("invalid automaton descriptor (the grammar threw)")
    ne.message += String(e)
    throw ne
  }
  if (parser.results.length === 0) {
    throw new Error("invalid automaton descriptor (no results after parsing)")
  }

  let parserOutput: NomenclatureOutput = parser.results[0]
  let transitionNumber: bigint
  let result: Rule

  // Manage the case where the rule descriptor contains no letter
  // In that case, we want to produce a rule with a neigborhood size of three
  // and with sufficiently many colors that the number makes sense in that rule
  if (parserOutput[0] === "numeric") {
    transitionNumber = BigInt(parserOutput[1])
    let stateCount = 0
    try {
      for (let k = 2n; k < 99n; k++) {
        if (k ** (k ** 3n) > transitionNumber) {
          stateCount = Number(k)
          break
        }
      }
    } catch (e) {
      if (e instanceof RangeError) {
      } else {
        throw e
      }
    }

    if (stateCount === 0) {
      throw new Error(
        "the transition number is too big (failed to obtain a big enough stateCount value for neighborhood 3)",
      )
    }

    result = {
      dimension: 1,
      neighborhoodSize: 3,
      stateCount,
      transitionFunction: computeTransitionFunction(3, stateCount, transitionNumber),
    }
  } else if (parserOutput[0] === "elementary") {
    transitionNumber = BigInt(parserOutput[1])

    result = {
      dimension: 1,
      neighborhoodSize: 3,
      stateCount: 2,
      transitionFunction: computeTransitionFunction(3, 2, transitionNumber),
    }
  } else {
    // The grammar guarantees that a transition number is specified
    transitionNumber = BigInt(parserOutput[1].transitionString[0])

    result = {
      dimension: +(parserOutput[1].dimension ?? 1),
      neighborhoodSize: +(parserOutput[1].neighborhoodSize ?? 3),
      stateCount: +(parserOutput[1].colors ?? 2),
      transitionFunction: [],
    }
    result.transitionFunction = computeTransitionFunction(
      result.neighborhoodSize,
      result.stateCount,
      transitionNumber,
    )

    if (result.stateCount < 1) {
      throw new Error("the state count must be at least 1")
    }
  }

  // if (transitionNumber >= BigInt(result.stateCount) ** (BigInt(result.stateCount) ** 3n)) {
  //   throw new Error("the transition number is too big")
  // }
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
