import { describe, expect, it } from "vitest"

import { createAutomatonEngine } from "./Engine"
import { elementaryRule } from "./curatedAutomata"
import { createRandomMapper } from "./misc/RandomMapper"
import { createSlowLoopEngine } from "./slowLoopTestEngine"
import { rule110Topology10 } from "./test-provisionning"

describe("createAutomatonEngine", () => {
  let topology = rule110Topology10
  let automaton = elementaryRule(110)

  let engine = createAutomatonEngine({
    automaton: elementaryRule(110),
    topology,
    seed: "_",
    interventionColorIndex: 2,
  })

  let randomMapper = createRandomMapper({ seedString: "_" })
  let slowEngine = createSlowLoopEngine(automaton, topology, randomMapper)

  it.each(Array.from({ length: 3 }, (_, k) => [k, k]))(`line %i`, (k) => {
    expect(engine.getLine(k)).toEqual(slowEngine.getLine(k))
  })
})
