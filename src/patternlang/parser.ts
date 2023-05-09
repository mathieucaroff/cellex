import { default as nearley } from "nearley"

import { SideBorder, TopBorder } from "./BorderType"
import patternGrammar from "./patternLanguage.ne"
import sideBorderGrammar from "./sideBorderLanguage.ne"
import topBorderGrammar from "./topBorderLanguage.ne"

export let createSideBorderParser = () => {
  return new nearley.Parser(sideBorderGrammar)
}

export let createTopBorderParser = () => {
  return new nearley.Parser(topBorderGrammar)
}

export let createPatternParser = () => {
  return new nearley.Parser(patternGrammar)
}

export let parse = <T>(input: string, name: string, parser: nearley.Parser, defaultValue: T): T => {
  // Run
  try {
    parser.feed(input)
  } catch (e) {
    // console.error("e")
  }

  // Aquire results
  if (parser.results === undefined || parser.results.length === 0) {
    return defaultValue
  }
  if (parser.results.length > 1) {
    // console.warn(`parsed several ${name} results:`, parser.results)
  }

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
  let defaultValue = {
    init: emptyRootGroup,
    cycle: defaultCycle,
  }
  return parse(input, "side border", createSideBorderParser(), defaultValue)
}

export let parseTopBorder = (input: string): TopBorder => {
  let defaultValue = {
    center: emptyRootGroup,
    cycleLeft: defaultCycle,
    cycleRight: defaultCycle,
  }
  return parse(input, "top border", createTopBorderParser(), defaultValue)
}
