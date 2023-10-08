import { Automaton } from "../../automatonType"
import { Stepper } from "../../engineType"
import { TopologyFinite } from "../../topologyType"
import { RandomMapper } from "../RandomMapper"
import { createTableCodeStepper } from "./tableCode"
import { createTableRuleStepper } from "./tableRule"

export function createStepper(
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

  let stepper: Stepper
  if (automaton.kind === "tableCode") {
    stepper = createTableCodeStepper(automaton, topology, randomMapper)
  } else if (automaton.kind === "tableRule") {
    stepper = createTableRuleStepper(automaton, topology, randomMapper)
  } else {
    throw new Error(`unhandled automaton kind: ${automaton.kind}`)
  }

  return stepper
}
