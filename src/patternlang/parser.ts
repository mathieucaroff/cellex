import { default as nearley } from "nearley"

import { ordinalNumber } from "../util/ordinalNumber"
import { SideBorder, TopBorder } from "./BorderType"
import { Pattern, PatternColor, PatternWithColor } from "./PatternType"
import { default as patternGrammar } from "./patternLanguage.ne"
import { default as sideBorderGrammar } from "./sideBorderLanguage.ne"
import { default as topBorderGrammar } from "./topBorderLanguage.ne"

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

export let parse = <T>(input: string, name: string, parser: nearley.Parser): T => {
  // Run
  try {
    parser.feed(input)
  } catch (e) {
    let position = e.offset + 1 === input.length ? "last" : ordinalNumber(e.offset + 1)
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
    throw new ErrorWithInfo(`invalid ${name} descriptor (no result after parsing)`, info, input)
  }

  return parser.results[0]
}

export let parseSideBorder = (input: string): SideBorder => {
  return parse(input, "side border", createSideBorderParser())
}

export let parseTopBorder = (input: string): TopBorder => {
  return parse(input, "top border", createTopBorderParser())
}

export let parsePatternList = (input: string): PatternWithColor[] => {
  if (input === "") {
    return []
  }
  return input.split(",").map((patternWithColor) => {
    let colorSeparator = patternWithColor.lastIndexOf(":")
    let descriptor = patternWithColor.slice(0, colorSeparator)
    let colorName = patternWithColor.slice(colorSeparator + 1)
    let pattern = parse<Pattern>(descriptor, "pattern", createPatternParser())
    let colorMap: Record<string, PatternColor> = {
      r: "red",
      g: "green",
      b: "blue",
      c: "cyan",
      m: "magenta",
      y: "yellow",
    }

    let color = colorMap[colorName.slice(0, 1).toLowerCase()]

    return { pattern, color }
  })
}
;(globalThis as any).parseTopBorder = parseTopBorder
;(globalThis as any).parseSideBorder = parseSideBorder
;(globalThis as any).parsePatternList = parsePatternList
