import { FastifyInstance } from "fastify"
import { Jimp } from "jimp"

import { parseColorMap } from "../display/Display"
import { fillImageData } from "../display/fill"
import { createAutomatonEngine } from "../engine/Engine"
import { randomGoodRule } from "../engine/curatedAutomata"
import { parseAutomaton } from "../nomenclature/nomenclature"
import { parseTopBorder } from "../patternlang/parser"

export function addRenderRoute(fastify: FastifyInstance) {
  fastify.get("/render.png", async (request, reply) => {
    let query = request.query as Record<string, string>
    let width = Number(query.width) || 455
    let height = Number(query.height) || 256
    let data = new Uint8ClampedArray(width * height * 4)

    let getFirst = <T>(key: string, parse: (v: string) => T, alt: () => T) => {
      let value = request.query[key]
      try {
        if (Array.isArray(value)) {
          return parse(value[0])
        } else if (value !== undefined) {
          return parse(value)
        }
      } catch {}
      return alt()
    }

    let automaton = getFirst("automaton", parseAutomaton, randomGoodRule)

    let isElementary = automaton.neighborhoodSize === 3 && automaton.stateCount === 2

    let genesisString = getFirst(
      "genesis",
      (x) => x,
      () => (isElementary ? "([01])" : "(0)1(0)"),
    )

    let defaultColorMap = "#0a0a0a;#00c3ff;#ffa700;#0100c8;#00bd00;#b60303;#ffff00;#B0B0B0;#ff57eb"

    let colorMap = getFirst("colorMap", parseColorMap, () => parseColorMap(defaultColorMap))

    let engine = createAutomatonEngine({
      automaton,
      topology: {
        finitness: "finite",
        kind: "loop",
        width: width + ((automaton.neighborhoodSize - 1) / 2) * height,
        genesis: parseTopBorder(genesisString),
      },
      seed: getFirst(
        "seed",
        (x) => x,
        () => "_",
      ),
      interventionColorIndex: colorMap.length - 1,
    })

    fillImageData(width, engine, { data }, width, height, 0, 0, 0, 0, colorMap)

    let jimp = Jimp.fromBitmap({
      width,
      height,
      data,
    })

    let mimeType = "image/png"
    let buffer = await jimp.getBuffer(mimeType)

    reply.type(mimeType)
    reply.header("Content-Length", buffer.length)
    reply.send(buffer)
  })
}
