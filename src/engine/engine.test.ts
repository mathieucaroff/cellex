import { describe, expect, it } from "vitest"

import { group, rootGroup } from "../patternlang/patternUtil"
import {
  createAutomatonEngine,
  getSideBorderValue,
  getStochastic,
  getTopBorderValue,
  runStochastic,
} from "./Engine"
import { createRandomMapper } from "./RandomMapper"
import { elementaryRule } from "./automaton"
import { createTableRuleCalculator } from "./calculator/tableRule"
import {
  cMap,
  one,
  qw1,
  r1,
  r2,
  r10,
  random01,
  rule110Topology10,
  ts,
  two,
  zero,
} from "./engine.test-provisionning"
import { createSlowLoopEngine } from "./slowLoopTestEngine"

it("runStochastic", () => {
  expect(runStochastic(zero, 0)).toBe(0)
  expect(runStochastic(one, 0)).toBe(1)

  expect(runStochastic({ ...ts, ...qw1, ...cMap([1, 2]) }, 0)).toBe(0)
  expect(runStochastic({ ...ts, ...qw1, ...cMap([1, 2]) }, 1)).toBe(1)

  expect(runStochastic({ ...ts, ...qw1, ...cMap([9, 10]) }, 8)).toBe(0)
  expect(runStochastic({ ...ts, ...qw1, ...cMap([9, 10]) }, 9)).toBe(1)
})

it("getTopBorderValue", () => {
  let genesisA = {
    center: rootGroup([random01, random01, random01]),
    cycleLeft: rootGroup([zero]),
    cycleRight: rootGroup([one]),
  }
  // (always zero)
  expect(getTopBorderValue(genesisA, -2, r10)).toBe(0)
  // (zero or one)
  expect(getTopBorderValue(genesisA, -1, r2)).toBe(1)
  expect(getTopBorderValue(genesisA, 0, r10)).toBe(0)
  expect(getTopBorderValue(genesisA, 1, r10)).toBe(1)
  // (always one)
  expect(getTopBorderValue(genesisA, 2, r10)).toBe(1)
})

it("getStochastic", () => {
  let g = group([zero, one, random01, group([two])(2)])(2)

  expect(getStochastic(g, 0)).toBe(zero)
  expect(getStochastic(g, 1)).toBe(one)
  expect(getStochastic(g, 2)).toBe(random01)
  expect(getStochastic(g, 3)).toBe(two)
  expect(getStochastic(g, 4)).toBe(two)

  expect(getStochastic(g, 5)).toBe(zero)
  expect(getStochastic(g, 6)).toBe(one)
  expect(getStochastic(g, 7)).toBe(random01)
  expect(getStochastic(g, 8)).toBe(two)
  expect(getStochastic(g, 9)).toBe(two)
})

it("getSideBorderValue", () => {
  let sideBorder = { init: rootGroup([]), cycle: rootGroup([zero]) }
  expect(getSideBorderValue(sideBorder, 0, r1)).toBe(0)
  expect(getSideBorderValue(sideBorder, 1, r1)).toBe(0)
  expect(getSideBorderValue(sideBorder, 2, r1)).toBe(0)
})

describe("createAutomatonEngine", () => {
  let topology = rule110Topology10
  let randomMapper = createRandomMapper({ seedString: "_" })
  let parameterArray = [elementaryRule(110), topology, randomMapper] as const

  let engine = createAutomatonEngine(
    createTableRuleCalculator(...parameterArray),
    topology,
    randomMapper,
  )
  let slowEngine = createSlowLoopEngine(...parameterArray)

  it.each(Array.from({ length: 3 }, (_, k) => [k, k]))(`line %i`, (k) => {
    expect(engine.getLine(k)).toEqual(slowEngine.getLine(k))
  })
})
