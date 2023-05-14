import { default as nearley } from "nearley"

import sideBorderGrammar from "../patternLang.ne"
import topBorderGrammar from "../sideBorderLang.ne"
import patternGrammar from "../topBorderLang.ne"

export let createSideBorderParser = () => {
  return new nearley.Parser(sideBorderGrammar)
}

export let createTopBorderParser = () => {
  return new nearley.Parser(topBorderGrammar)
}

export let createPatternParser = () => {
  return new nearley.Parser(patternGrammar)
}

export let parseSideBorder = (input: string) => {
  let parser = createSideBorderParser()
  parser.feed(input)
  parser[0]
  // Run
  try {
    parser.feed(input)
  } catch {}

  return parser.results // TODO
}

export let parseTopBorder = (input: string) => {
  let parser = createTopBorderParser()
  parser.feed(input)
  parser[0]
  // Run
  try {
    parser.feed(input)
  } catch {}

  return parser.results // TODO
}

export let presentTopBorder = () => "()"
export let presentSideBorder = () => "()"
