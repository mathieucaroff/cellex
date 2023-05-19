import { default as nearley } from "nearley"
import { it } from "vitest"

import { Case, testEngine } from "../lib/languageTestEngine"
import { Pattern, PatternElement, PatternGroup, PatternRootGroup, PatternSet } from "./PatternType"
import patternGrammar from "./topBorderLanguage.ne"

export let createPatternParser = () => {
  return new nearley.Parser(patternGrammar)
}

type Qwvc1 = {
  quantity: 1
  width: 1
  visibility: "visible"
  capture: "visible"
}

let qwvc1: Qwvc1 = {
  quantity: 1,
  width: 1,
  visibility: "visible",
  capture: "visible",
}
let zero: PatternSet = { type: "set", stateSet: [0], ...qwvc1 }
let one: PatternSet = { type: "set", stateSet: [1], ...qwvc1 }
let zo: PatternSet = { type: "set", stateSet: [0, 1], ...qwvc1 }

let stateSetList = [[0], [1], [0, 1]]

let visibilityList = [
  {
    capture: "hidden" as "hidden",
    visibility: "hidden" as "hidden",
  },
  {
    capture: "hidden" as "hidden",
    visibility: "visible" as "visible",
  },
  {
    capture: "visible" as "visible",
    visibility: "visible" as "visible",
  },
]

let set = (p: number, q = 1): PatternSet => {
  let quantity = q >= 0 ? q : -q
  return {
    type: "set",
    stateSet: stateSetList[p],
    quantity,
    width: quantity,
    visibility: q >= 0 ? "visible" : "hidden",
  }
}

let pattern0: PatternRootGroup = { type: "group", content: [zero], ...qwvc1 }

let group = (visib: number, quantity: number, ...content: PatternElement[]): PatternGroup => {
  return {
    type: "group",
    content,
    quantity,
    width: quantity * content.reduce((acc, val) => acc + val.width, 0),
    ...visibilityList[visib],
  }
}

let patternList: Case<string, Pattern>[] = [
  {
    input: "!0",
    target: "success",
    output: {
      type: "exact",
      repetition: "none",
      persistence: "none",
      pattern: pattern0,
    },
  },
  {
    input: "^0",
    target: "success",
    output: {
      type: "triangle",
      repetition: "none",
      persistence: "persistent",
      pattern: pattern0,
    },
  },
  {
    input: "=0",
    target: "success",
    output: {
      type: "cyclic",
      repetition: "cycle",
      persistence: "none",
      pattern: pattern0,
    },
  },
  {
    input: "#0",
    target: "success",
    output: {
      type: "grid",
      repetition: "cycle",
      persistence: "persistent",
      pattern: pattern0,
    },
  },
  {
    input: "#1",
    target: "success",
    output: {
      type: "grid",
      repetition: "cycle",
      persistence: "persistent",
      pattern: { type: "group", content: [one], ...qwvc1 },
    },
  },
  {
    input: "#0(01[01](:?0)(:?[01]11{2})0{2}[01]{3}([1]1){4}([01][01]){5}){7}",
    target: "success",
    output: {
      type: "grid",
      repetition: "cycle",
      persistence: "persistent",
      pattern: {
        type: "group",
        content: [
          zero,
          group(
            2,
            7,
            zero,
            one,
            zo,
            group(0, 1, set(0, -1)),
            group(0, 1, set(2, -1), set(1, -1), set(1, -2)),
            set(0, 2),
            set(2, 3),
            group(2, 4, one, one),
            group(2, 5, zo, zo),
          ),
        ],
        quantity: 1,
        width: 218, // unsure
        visibility: "visible",
        capture: "visible",
      },
    },
  },
  {
    input: "!0(0)",
    target: "failure",
  },
]

testEngine(patternList, createPatternParser, it)
