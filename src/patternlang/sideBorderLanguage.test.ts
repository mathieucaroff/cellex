import { default as nearley } from "nearley"

import { testUnit } from "../devlib/testUnit"
import { BorderRootGroup, SideBorder, StochasticState } from "./BorderType"
import { presentSideBorder } from "./presenter"
import sideBorderGrammar from "./sideBorderLanguage.ne"

let { success, failure, successRevert } = testUnit<string, SideBorder>(
  (input: string) => {
    let parser = new nearley.Parser(sideBorderGrammar)
    parser.feed(input)
    if (parser.results.length === 0) {
      throw new Error("no results")
    }
    return parser.results[0]
  },
  (output: SideBorder) => {
    return presentSideBorder(output)
  },
)

/**
 * Note how the cumulative map is [1, 1] for 0 and is [0, 1] for 1.
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

successRevert("(0)", {
  init: emptyGroup,
  cycle: { type: "group", content: [zero], ...qw1 },
})
successRevert("(1)", {
  init: emptyGroup,
  cycle: { type: "group", content: [one], ...qw1 },
})
success("(0[0](0){1})", {
  init: emptyGroup,
  cycle: {
    type: "group",
    content: [zero, zero, { type: "group", content: [zero], quantity: 1, width: 1 }],
    quantity: 1,
    width: 3,
  },
})
successRevert("(11)", {
  init: emptyGroup,
  cycle: { type: "group", content: [one, one], quantity: 1, width: 2 },
})
successRevert("(01)", {
  init: emptyGroup,
  cycle: { type: "group", content: [zero, one], quantity: 1, width: 2 },
})
successRevert("11(0)", {
  init: { type: "group", content: [one, one], quantity: 1, width: 2 },
  cycle: { type: "group", content: [zero], ...qw1 },
})
successRevert("([01])", {
  init: emptyGroup,
  cycle: { type: "group", content: [rand01], ...qw1 },
})
successRevert("([0001])", {
  init: emptyGroup,
  cycle: {
    type: "group",
    content: [{ type: "state", ...cMap([3, 4]), ...qw1 }],
    ...qw1,
  },
})
success("([01111])", {
  init: emptyGroup,
  cycle: {
    type: "group",
    content: [{ type: "state", ...cMap([1, 5]), ...qw1 }],
    quantity: 1,
    width: 1,
  },
})
successRevert("(0[01]0)", {
  init: emptyGroup,
  cycle: {
    type: "group",
    content: [zero, { type: "state", ...cMap([1, 2]), ...qw1 }, zero],
    quantity: 1,
    width: 3,
  },
})
successRevert("(01{31})", {
  init: emptyGroup,
  cycle: {
    type: "group",
    content: [zero, { type: "state", ...cMap([0, 1]), quantity: 31, width: 31 }],
    quantity: 1,
    width: 32,
  },
})
success("(01{01})", {
  init: emptyGroup,
  cycle: { type: "group", content: [zero, one], quantity: 1, width: 2 },
})
success("(01{00})", {
  init: emptyGroup,
  cycle: {
    type: "group",
    content: [
      zero,
      {
        type: "state",
        ...cMap([0, 1]),
        quantity: 0,
        width: 0,
      },
    ],
    quantity: 1,
    width: 1,
  },
})
success("1{3}(011{4})", {
  init: {
    type: "group",
    content: [
      {
        type: "state",
        ...cMap([0, 1]),
        quantity: 3,
        width: 3,
      },
    ],
    quantity: 1,
    width: 3,
  },
  cycle: {
    type: "group",
    content: [zero, one, { type: "state", ...cMap([0, 1]), quantity: 4, width: 4 }],
    quantity: 1,
    width: 6,
  },
})
success("1{3}(11(01){4})", {
  init: {
    type: "group",
    content: [{ type: "state", ...cMap([0, 1]), quantity: 3, width: 3 }],
    quantity: 1,
    width: 3,
  },
  cycle: {
    type: "group",
    content: [one, one, { type: "group", content: [zero, one], quantity: 4, width: 8 }],
    quantity: 1,
    width: 10,
  },
})

failure("()")
failure("(0)0")
failure(")(0)")
failure("(0))")
failure("((0)")
failure("(0)(")
failure("1{3}(11(01))")
