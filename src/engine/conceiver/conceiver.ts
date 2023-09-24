import { Automaton } from "../../automatonType"
import { Conceiver } from "../../engineType"
import { TopologyFinite } from "../../topologyType"
import { RandomMapper } from "../RandomMapper"
import { createTableCodeConceiver } from "./tableCode"
import { createTableRuleConceiver } from "./tableRule"

export function createConceiver(
  automaton: Automaton,
  topology: TopologyFinite,
  randomMapper: RandomMapper,
) {
  if (automaton.stateCount > 16) {
    throw `state count must be at most 16 (got ${automaton.stateCount})`
  } else if (automaton.neighborhoodSize % 2 != 1) {
    throw `neighborhood size must be odd (got ${automaton.neighborhoodSize})`
  }

  if (automaton.reversible && ![1, 2, 4, 8, 16].includes(automaton.stateCount)) {
    throw `reversible automata's state count must be a power of two (got ${automaton.stateCount})`
  }

  let conceiver: Conceiver
  if (automaton.kind === "tableCode") {
    conceiver = createTableCodeConceiver(automaton, topology, randomMapper)
  } else if (automaton.kind === "tableRule") {
    conceiver = createTableRuleConceiver(automaton, topology, randomMapper)
  } else {
    throw new Error(`unhandled automaton kind: ${automaton.kind}`)
  }

  return conceiver
}
