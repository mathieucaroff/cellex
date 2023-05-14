import { FilterPattern, createFilter } from "@rollup/pluginutils"
import nearleyCore from "nearley"
import nearleyCompile from "nearley/lib/compile"
import nearleyGenerate from "nearley/lib/generate"
import nearleyGrammar from "nearley/lib/nearley-language-bootstrapped"

export interface ViteNearleyOptions {
  exclude?: FilterPattern
  include?: FilterPattern
}

export default function nearley({ include = "**/*.ne", exclude }: ViteNearleyOptions = {}) {
  const filter = createFilter(include, exclude)

  return {
    name: "vite-plugin-nearley",
    transform(code: string, id: string) {
      if (!filter(id)) {
        return undefined
      }
      // parsing the asset
      let grammarParser = new nearleyCore.Parser(nearleyGrammar)
      grammarParser.feed(code)
      let grammarAst = grammarParser.results[0]

      let grammarInfoObject = nearleyCompile(grammarAst, {
        args: [id],
      })

      let generatedCode: string = nearleyGenerate(grammarInfoObject, "grammar")

      let truncatedCode = generatedCode
        .replace(/^.*\n.*\n.*\n/, "")
        .replace(/.*\n.*\n.*\n.*\n.*\n.*\n$/, "")

      let importHeader: string[] = []
      let filteredCode = truncatedCode.replace(
        /const \{\n((\ *[a-zA-Z]+,\n)*)\} = require\('([^']+)'\)/g,
        (match, g1, g2, g3) => {
          importHeader.push(`import {\n${g1}} from '${g3}'\n`)
          return ""
        },
      )
      let codeResult = importHeader.join("") + filteredCode + "\nexport default grammar"

      return { code: codeResult }
    },
  }
}
