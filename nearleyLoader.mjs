import nearleyCore from "nearley"
import nearleyCompile from "nearley/lib/compile.js"
import nearleyGenerate from "nearley/lib/generate.js"
import nearleyLint from "nearley/lib/lint.js"
import nearleyGrammar from "nearley/lib/nearley-language-bootstrapped.js"

/** @param {string} input */
export default function (input) {
  let grammarParser = new nearleyCore.Parser(nearleyGrammar)
  grammarParser.feed(input)
  let grammarAst = grammarParser.results[0]
  var grammarInfoObject = nearleyCompile(grammarAst, {
    args: [this.resourcePath],
  })
  nearleyLint(grammarInfoObject, {})

  let generatedCode = nearleyGenerate(grammarInfoObject, "grammar")

  return generatedCode
}
