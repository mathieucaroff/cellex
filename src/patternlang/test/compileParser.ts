import fs from "fs"
import path from "path"

import { default as nearley } from "nearley"
import { default as neCompile } from "nearley/lib/compile"
import { default as neGenerate } from "nearley/lib/generate"
import { default as nearleyGrammar } from "nearley/lib/nearley-language-bootstrapped"

let compile = (sourceCode) => {
  // Move to directory of the source files, for @include-s to work
  let d = __dirname.split(path.sep).slice(0, -1).join(path.sep)
  process.chdir(d)

  // Parse the grammar source into an AST
  let grammarParser = new nearley.Parser(nearleyGrammar)
  grammarParser.feed(sourceCode)
  let grammarAst = grammarParser.results[0] // TODO check for errors

  // Compile the AST into a set of rules
  let grammarInfoObject = neCompile(grammarAst, { args: [] })
  // Generate JavaScript code from the rules
  let grammarJs = neGenerate(grammarInfoObject, "grammar")

  // Pretend this is a CommonJS environment to catch exports from the grammar.
  let module: any = { exports: {} }
  try {
    eval(grammarJs)
  } catch (e) {
    console.error("eval failed")
    throw e
  }

  let compiled = module.exports

  return nearley.Grammar.fromCompiled(compiled)
}

let sideBorderGrammar = compile(fs.readFileSync(__dirname + "/../sideBorderLanguage.ne", "utf-8"))
let topBorderGrammar = compile(fs.readFileSync(__dirname + "/../topBorderLanguage.ne", "utf-8"))
let patternGrammar = compile(fs.readFileSync(__dirname + "/../patternLanguage.ne", "utf-8"))

export let createSideBorderParser = () => {
  return new nearley.Parser(sideBorderGrammar)
}

export let createTopBorderParser = () => {
  return new nearley.Parser(topBorderGrammar)
}

export let createPatternParser = () => {
  return new nearley.Parser(patternGrammar)
}
