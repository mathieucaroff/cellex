import assert from "assert"
import { TopBorder } from "../../patternlang/BorderType"
import { group, rootGroup } from "../../patternlang/patternUtil"
import {
    createAutomatonEngine,
    getSideBorderValue,
    getStochastic,
    getTopBorderValue,
    runStochastic,
} from "../Engine"
import { createAutomatonEngine as createSlowLoopEngine } from "./slowLoopEngine"
import { createRandomMapper } from "../RandomMapper"
import { elementaryRule } from "../rule"

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

// runStochastic
assert(runStochastic(zero, 0) == 0)
assert(runStochastic(one, 0) == 1)

assert(runStochastic({ ...ts, ...qw1, ...cMap([1, 2]) }, 0) == 0)
assert(runStochastic({ ...ts, ...qw1, ...cMap([1, 2]) }, 1) == 1)

assert(runStochastic({ ...ts, ...qw1, ...cMap([9, 10]) }, 8) == 0)
assert(runStochastic({ ...ts, ...qw1, ...cMap([9, 10]) }, 9) == 1)

// getTopBorderValue
let genesisA = {
    center: rootGroup([random01, random01, random01]),
    cycleLeft: rootGroup([zero]),
    cycleRight: rootGroup([one]),
}
// (always zero)
assert(getTopBorderValue(genesisA, -2, r10) == 0)
// (zero or one)
assert(getTopBorderValue(genesisA, -1, r2) == 1)
assert(getTopBorderValue(genesisA, 0, r10) == 0)
assert(getTopBorderValue(genesisA, 1, r10) == 1)
// (always one)
assert(getTopBorderValue(genesisA, 2, r10) == 1)

// getStochastic
let g = group([zero, one, random01, group([two])(2)])(2)

assert(getStochastic(g, 0) == zero)
assert(getStochastic(g, 1) == one)
assert(getStochastic(g, 2) == random01)
assert(getStochastic(g, 3) == two)
assert(getStochastic(g, 4) == two)

assert(getStochastic(g, 5) == zero)
assert(getStochastic(g, 6) == one)
assert(getStochastic(g, 7) == random01)
assert(getStochastic(g, 8) == two)
assert(getStochastic(g, 9) == two)

// getSideBorderValue
let sideBorder = { init: rootGroup([]), cycle: rootGroup([zero]) }
assert(getSideBorderValue(sideBorder, 0, r1) == 0)
assert(getSideBorderValue(sideBorder, 1, r1) == 0)
assert(getSideBorderValue(sideBorder, 2, r1) == 0)

let content = [..."11111000100110"].map((c) => (c === "1" ? one : zero))
let width = content.length

// createAutomatonEngine
let genesisB: TopBorder = {
    center: { content: [], quantity: 1, type: "group", width: 0 },
    cycleLeft: { content, quantity: 1, type: "group", width },
    cycleRight: { content, quantity: 1, type: "group", width },
}
let engineB = createAutomatonEngine(
    elementaryRule(110),
    {
        kind: "loop",
        finitness: "finite",
        width: 10,
        genesis: genesisB,
    },
    createRandomMapper({ seedString: "_" }),
)
let engineC = createSlowLoopEngine(
    elementaryRule(110),
    {
        kind: "loop",
        finitness: "finite",
        width: 10,
        genesis: genesisB,
    },
    createRandomMapper({ seedString: "_" }),
)

assert.deepStrictEqual(engineB.getLine(0), engineC.getLine(0), "line 0")
assert.deepStrictEqual(engineB.getLine(1), engineC.getLine(1), "line 1")
assert.deepStrictEqual(engineB.getLine(2), engineC.getLine(2), "line 2")
