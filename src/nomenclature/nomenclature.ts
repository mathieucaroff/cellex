import { default as nearley } from "nearley"

import { Domain, TableAutomaton } from "../automatonType"
import {
  computeAnyTransitionTable,
  computeCodeTransitionTable,
  computeRuleTransitionTable,
  computeTransitionNumber,
} from "../engine/curatedAutomata"
import { isPowerOfTwo } from "../engine/domain"
import { ErrorWithInfo, parse } from "../patternlang/parser"
import { limitLength } from "../util/limitLength"
import { thousandSplit } from "../util/thousandSplit"
import nomenclatureGrammar from "./nomenclature.ne"

type NomenclatureOutput =
  | { kind: "numeric"; transitionString: string }
  | { kind: "elementary"; transitionString: string; reversible: boolean }
  | {
      kind: "any"
      automaton: {
        dimension?: [string]
        neighborhoodSize?: [string]
        colors?: [string]
        table: {
          tableKind: "rule" | "code"
          transitionString: string
        }
        reversible: boolean
      }
    }

export function parseAutomaton(descriptor: string): TableAutomaton {
  let parserOutput: NomenclatureOutput = parse(
    descriptor,
    "automaton descriptor",
    new nearley.Parser(nomenclatureGrammar),
  )
  let transitionNumber: bigint
  let result: TableAutomaton

  // In that case, we want to produce a rule with a neigborhood size of three
  // and with sufficiently many colors that the number makes sense in that rule
  if (parserOutput.kind === "numeric") {
    transitionNumber = BigInt(parserOutput.transitionString)
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
      throw new ErrorWithInfo(
        "the transition number is too big (failed to obtain a big enough stateCount value for neighborhood 3)",
        `the transition number is too big`,
        descriptor,
      )
    }

    result = {
      kind: "tableRule",
      dimension: 1,
      neighborhoodSize: 3,
      stateCount,
      reversible: false,
      transitionTable: computeRuleTransitionTable(3, stateCount, transitionNumber),
    }
  } else if (parserOutput.kind === "elementary") {
    transitionNumber = BigInt(parserOutput.transitionString)

    if (transitionNumber >= 256n) {
      throw new ErrorWithInfo("elementary automata numbers go from 0 to 255", undefined, descriptor)
    }

    result = {
      kind: "tableRule",
      dimension: 1,
      neighborhoodSize: 3,
      stateCount: 2,
      reversible: !!parserOutput.reversible,
      transitionTable: computeRuleTransitionTable(3, 2, transitionNumber),
    }
  } else if (parserOutput.kind === "any") {
    // The grammar guarantees that a transition number is specified
    let { automaton } = parserOutput
    transitionNumber = BigInt(automaton.table.transitionString)

    let isRule = parserOutput.automaton.table.tableKind === "rule"

    let neighborhoodSize = +(automaton.neighborhoodSize ?? 3)
    let stateCount = +(automaton.colors ?? 2)

    let transitionTable = computeAnyTransitionTable(
      stateCount,
      isRule ? stateCount ** neighborhoodSize : (stateCount - 1) * neighborhoodSize + 1,
      transitionNumber,
    )

    result = {
      kind: isRule ? "tableRule" : "tableCode",
      dimension: +(automaton.dimension ?? 1),
      neighborhoodSize,
      stateCount,
      reversible: !!automaton.reversible,
      transitionTable,
    }
  } else {
    throw new Error("unrecognized parse output: " + JSON.stringify(parserOutput))
  }

  if (result.stateCount < 1) {
    throw new ErrorWithInfo("the state count must be at least 1", undefined, descriptor)
  }

  if (result.reversible && !isPowerOfTwo(result.stateCount)) {
    throw new ErrorWithInfo(
      `the color count of reversible automata must be a power of two (1,2,4,16,...) (got ${result.stateCount}c)`,
      undefined,
      descriptor,
    )
  }

  return result
}

function presentDomainBeginning(domain: Domain) {
  let regular: string[] = []
  let long: string[] = []
  if (domain.dimension !== 1) {
    regular.push(`${domain.dimension}d`)
    long.push(`${domain.dimension} dimensions`)
  }
  if (domain.neighborhoodSize !== 3) {
    regular.push(`ns${domain.neighborhoodSize}`)
    long.push(`neighborhood size ${domain.neighborhoodSize}`)
  }
  if (domain.stateCount !== 2) {
    regular.push(`${domain.stateCount}c`)
    long.push(`${domain.stateCount} colors`)
  }
  return {
    descriptor: regular.join(","),
    longDescriptor: long.join(", "),
  }
}

export function presentDomain(domain: Domain) {
  let { descriptor, longDescriptor } = presentDomainBeginning(domain)
  if (descriptor.length === 0) {
    descriptor = "e"
    longDescriptor = "elementary"
  }
  return {
    descriptor: `${descriptor}${domain.reversible ? ",r" : ""}`,
    longDescriptor: `${longDescriptor}${domain.reversible ? ", reversible" : ""}`,
  }
}

export function presentAutomaton(automaton: TableAutomaton, param: { lengthLimit?: number } = {}) {
  let ts = thousandSplit(String(computeTransitionNumber(automaton)))
  let tn = limitLength(ts, param.lengthLimit)

  let { descriptor, longDescriptor } = presentDomainBeginning(automaton)
  let regular: string[] = descriptor ? [descriptor] : []
  let long: string[] = longDescriptor ? [longDescriptor] : []

  let reversible = automaton.reversible ? "reversible " : ""
  let r = automaton.reversible ? "r" : ""

  if (automaton.kind === "tableCode") {
    regular.push(`${r}c${tn}`)
    long.push(`${reversible}code ${tn}`)
  } else {
    if (regular.length === 0) {
      regular.push(`${r}e${tn}`)
      long.push(`${reversible}elementary ${tn}`)
    } else {
      regular.push(`${r}r${tn}`)
      long.push(`${reversible}rule ${tn}`)
    }
  }
  return {
    descriptor: regular.join(","),
    longDescriptor: long.join(", "),
  }
}

export function normalizeNomenclature(descriptor: string) {
  return presentAutomaton(parseAutomaton(descriptor)).descriptor
}
