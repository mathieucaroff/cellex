import { describe, expect, it } from "vitest"

import { elementaryRule } from "./curatedAutomata"
import { createRandomMapper } from "./misc/RandomMapper"
import { createAutomatonRoller } from "./roller/Roller"
import { createSlowLoopEngine } from "./slowLoopTestEngine"
import { createTableRuleStepper } from "./stepper/tableRule"
import { rule110Topology10 } from "./test-provisionning"

describe("createAutomatonEngine", () => {
  let topology = rule110Topology10
  let randomMapper = createRandomMapper({ seedString: "_" })
  let parameterArray = [elementaryRule(110), topology, randomMapper] as const

  let engine = createAutomatonRoller(
    createTableRuleStepper(...parameterArray),
    topology,
    randomMapper,
  )
  let slowEngine = createSlowLoopEngine(...parameterArray)

  it.each(Array.from({ length: 3 }, (_, k) => [k, k]))(`line %i`, (k) => {
    expect(engine.getLine(k)).toEqual(slowEngine.getLine(k))
  })
})
