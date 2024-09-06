import { default as nearley } from "nearley"

import { ordinalNumber } from "../util/ordinalNumber"
import { SideBorder, TopBorder } from "./BorderType"
// import { default as patternGrammar } from "./patternLanguage.ne"
// import { default as sideBorderGrammar } from "./sideBorderLanguage.ne"
// import { default as topBorderGrammar } from "./topBorderLanguage.ne"
import patternGrammar from "./patternLanguage.ne"
import sideBorderGrammar from "./sideBorderLanguage.ne"
import topBorderGrammar from "./topBorderLanguage.ne"

export class ErrorWithInfo extends Error {
  constructor(
    public message: string,
    public info: string | undefined,
    public input: string,
    public originalError?: any,
  ) {
    super(message)
    if (info === undefined) {
      this.info = message
    }
  }
}

export let createSideBorderParser = () => {
  return new nearley.Parser(sideBorderGrammar)
}

export let createTopBorderParser = () => {
  return new nearley.Parser(topBorderGrammar)
}

export let createPatternParser = () => {
  return new nearley.Parser(patternGrammar)
}

export let parse = <T>(
  input: string,
  name: string,
  parser: nearley.Parser,
): T => {
  // Run
  try {
    parser.feed(input)
  } catch (err) {
    let e = err as any
    let position =
      e.offset + 1 === input.length ? "last" : ordinalNumber(e.offset + 1)
    throw new ErrorWithInfo(
      String(e),
      `unexpected ${position} character: \`${e.token.value}\``,
      input,
      e,
    )
  }

  if (parser.results === undefined || parser.results.length === 0) {
    // No result after parsing
    let info = ""
    if (input.length > 0) {
      info = "incomplete input"
    }
    throw new ErrorWithInfo(
      "invalid automaton descriptor (no result after parsing)",
      info,
      input,
    )
  }

  // if (parser.results.length > 1) {
  //   console.warn(`parsed several ${name} results:`, parser.results)
  // }

  return parser.results[0]
}

const emptyRootGroup = {
  content: [] as any[],
  quantity: 1 as const,
  width: 0,
  type: "group" as const,
}
const defaultCycle = {
  content: [
    {
      type: "state" as const,
      quantity: 1,
      width: 1,
      cumulativeMap: [1, 2],
      total: 2,
    },
  ],
  quantity: 1 as const,
  width: 1,
  type: "group" as const,
}

export let parseSideBorder = (input: string): SideBorder => {
  return parse(input, "side border", createSideBorderParser())
}

export let parseTopBorder = (input: string): TopBorder => {
  return parse(input, "top border", createTopBorderParser())
}
;(globalThis as any).parseTopBorder = parseTopBorder
;(globalThis as any).parseSideBorder = parseSideBorder
