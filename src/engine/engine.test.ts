import { expect, it } from "vitest"

import { TopBorder } from "../patternlang/BorderType"
import { group, rootGroup } from "../patternlang/patternUtil"
import {
  createAutomatonEngine,
  getSideBorderValue,
  getStochastic,
  getTopBorderValue,
  runStochastic,
} from "./Engine"
import { createRandomMapper } from "./RandomMapper"
import { elementaryRule } from "./rule"
import { createAutomatonEngine as createSlowLoopEngine } from "./slowLoopTestEngine"

const ts = { type: "state" as const }
const qw1 = { quantity: 1, width: 1 }
const r1 = (x) => 0 // "random 1"
const r2 = (x) => ((x % 2) + 2) % 2 // "random 2"
const r10 = (x) => ((x % 10) + 10) % 10 // "random 10"
let cMap = (cumulativeMap: number[]) => {
  return { cumulativeMap, total: cumulativeMap.slice(-1)[0] }
}

let zero = { ...ts, ...qw1, ...cMap([1]) }
let one = { ...ts, ...qw1, ...cMap([0, 1]) }
let random01 = { ...ts, ...qw1, ...cMap([1, 2]) }

let two = { ...ts, ...qw1, ...cMap([0, 0, 1]) }

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

it("createAutomatonEngine", () => {
  let content = [..."11111000100110"].map((c) => (c === "1" ? one : zero))
  let width = content.length
  let genesis: TopBorder = {
    center: { content: [], quantity: 1, type: "group", width: 0 },
    cycleLeft: { content, quantity: 1, type: "group", width },
    cycleRight: { content, quantity: 1, type: "group", width },
  }

  let parameterArray = [
    elementaryRule(110),
    {
      kind: "loop",
      finitness: "finite",
      width: 10,
      genesis,
    },
    createRandomMapper({ seedString: "_" }),
  ] as const

  let engine = createAutomatonEngine(...parameterArray)
  let slowEngine = createSlowLoopEngine(...parameterArray)

  Array.from({ length: 3 }, (_, k) => {
    expect(engine.getLine(k), `line ${k}`).toEqual(slowEngine.getLine(0))
  })
})
