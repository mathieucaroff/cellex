import { default as nearley } from "nearley"

import { testUnit } from "../devlib/testUnit"
import { Pattern, PatternElement, PatternGroup, PatternRootGroup, PatternSet } from "./PatternType"
import patternGrammar from "./patternLanguage.ne"

let { success, failure } = testUnit<string, Pattern>((input: string) => {
  let parser = new nearley.Parser(patternGrammar)
  parser.feed(input)
  if (parser.results.length === 0) {
    throw new Error("no results")
  }
  return parser.results[0]
})

type Qwv1 = {
  quantity: 1
  width: 1
  visibility: "visible"
}

let qwv1: Qwv1 = {
  quantity: 1,
  width: 1,
  visibility: "visible",
}

type Qwvc1 = Qwv1 & {
  capture: "visible"
}

let qwvc1: Qwvc1 = {
  ...qwv1,
  capture: "visible",
}
let zero: PatternSet = { type: "set", stateSet: [0], ...qwv1 }
let one: PatternSet = { type: "set", stateSet: [1], ...qwv1 }
let zo: PatternSet = { type: "set", stateSet: [0, 1], ...qwv1 }

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

success("!0", {
  type: "exact",
  repetition: "none",
  persistence: "none",
  pattern: pattern0,
})
success("^0", {
  type: "triangle",
  repetition: "none",
  persistence: "persistent",
  pattern: pattern0,
})
success("=0", {
  type: "cyclic",
  repetition: "cycle",
  persistence: "none",
  pattern: pattern0,
})
success("#0", {
  type: "grid",
  repetition: "cycle",
  persistence: "persistent",
  pattern: pattern0,
})
success("#1", {
  type: "grid",
  repetition: "cycle",
  persistence: "persistent",
  pattern: { type: "group", content: [one], ...qwvc1 },
})
success("#0(01[01](:?0)(:?[01]11{2})0{2}[01]{3}([1]1){4}([01][01]){5}){7}", {
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
})

failure("!0(0)")
