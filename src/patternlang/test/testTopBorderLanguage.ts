import { createTopBorderParser } from "./compileParser"
import { testEngine, Case, success, failure } from "./lib/languageTestEngine"
import { TopBorder, StochasticState, BorderRootGroup } from "../BorderType"

/**
 * Note how the cumulative map are [1] for 0 and is [0, 1] for 1.
 * It should be interpreted in the following way:
 *
 * * [1, 1][0] === 1 // 100% odds of getting 0
 * * [0, 1][0] === 0 // 0% odds of getting 0
 */
let cMap = (array: number[]) => ({
  cumulativeMap: array,
  total: array.slice(-1)[0],
})

let qw1: { quantity: 1; width: 1 } = { quantity: 1, width: 1 }
let zero: StochasticState = { type: "state", ...cMap([1]), ...qw1 }
let one: StochasticState = { type: "state", ...cMap([0, 1]), ...qw1 }
let rand01: StochasticState = { type: "state", ...cMap([1, 2]), ...qw1 }

let emptyGroup: BorderRootGroup = {
  type: "group",
  content: [],
  quantity: 1,
  width: 0,
}

let borderPatternList: Case<string, TopBorder>[] = [
  success("(0)(0)", {
    center: emptyGroup,
    cycleLeft: { type: "group", content: [zero], ...qw1 },
    cycleRight: { type: "group", content: [zero], ...qw1 },
  }),
  success("(0)0(0)", {
    center: { type: "group", content: [zero], ...qw1 },
    cycleLeft: { type: "group", content: [zero], ...qw1 },
    cycleRight: { type: "group", content: [zero], ...qw1 },
  }),
  success("([01])1([01])", {
    center: { type: "group", content: [one], ...qw1 },
    cycleLeft: { type: "group", content: [rand01], ...qw1 },
    cycleRight: { type: "group", content: [rand01], ...qw1 },
  }),
  failure("()"),
  failure("(0)0"),
  failure(")(0)"),
  failure("(0))"),
  failure("((0)"),
  failure("(0)("),
  failure("1{3}(11(01))"),
]

let main = () => {
  testEngine(borderPatternList, createTopBorderParser)
}

main()
