import { default as nearley } from "nearley"

import { Domain, TableAutomaton } from "../automatonType"
import {
  computeCodeTransitionTable,
  computeRuleTransitionTable,
  computeTransitionNumber,
} from "../engine/curatedAutomata"
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
  let parser = new nearley.Parser(nomenclatureGrammar)

  try {
    parser.feed(descriptor)
  } catch (e) {
    let ne = new Error("invalid automaton descriptor (the grammar threw)")
    ne.message += String(e)
    throw ne
  }
  if (parser.results.length === 0) {
    throw new Error("invalid automaton descriptor (no result after parsing)")
  }

  let parserOutput: NomenclatureOutput = parser.results[0]
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
      throw new Error(
        "the transition number is too big (failed to obtain a big enough stateCount value for neighborhood 3)",
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
      throw new Error("elementary transition numbers must be strictly less than 256")
    }

    result = {
      kind: "tableRule",
      dimension: 1,
      neighborhoodSize: 3,
      stateCount: 2,
      reversible: parserOutput.reversible,
      transitionTable: computeRuleTransitionTable(3, 2, transitionNumber),
    }
  } else if (parserOutput.automaton.table.tableKind === "rule") {
    // The grammar guarantees that a transition number is specified
    let { automaton } = parserOutput
    transitionNumber = BigInt(automaton.table.transitionString)

    result = {
      kind: "tableRule",
      dimension: +(automaton.dimension ?? 1),
      neighborhoodSize: +(automaton.neighborhoodSize ?? 3),
      stateCount: +(automaton.colors ?? [2])[0],
      reversible: automaton.reversible,
      transitionTable: [],
    }
    result.transitionTable = computeRuleTransitionTable(
      result.neighborhoodSize,
      result.stateCount,
      transitionNumber,
    )
  } else if (parserOutput.automaton.table.tableKind === "code") {
    let { automaton } = parserOutput
    transitionNumber = BigInt(automaton.table.transitionString)

    result = {
      kind: "tableCode",
      dimension: +(automaton.dimension ?? 1),
      neighborhoodSize: +(automaton.neighborhoodSize ?? 3),
      stateCount: +(automaton.colors ?? [2])[0],
      reversible: automaton.reversible,
      transitionTable: [],
    }
    result.transitionTable = computeCodeTransitionTable(
      result.neighborhoodSize,
      result.stateCount,
      transitionNumber,
    )
  } else {
    throw new Error("unrecognized parse output: " + JSON.stringify(parserOutput))
  }

  if (result.stateCount < 1) {
    throw new Error("the state count must be at least 1")
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

export function presentAutomaton(automaton: TableAutomaton) {
  let tn = thousandSplit(String(computeTransitionNumber(automaton)))

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
