import { parseColorMap } from "@/display/Display"
import { fillImageData } from "@/display/fill"
import { randomGoodRule } from "@/engine/curatedAutomata"
import { createAutomatonEngine } from "@/engine/Engine"
import { parseAutomaton } from "@/nomenclature/nomenclature"
import { parseTopBorder } from "@/patternlang/parser"

import { Jimp } from "jimp"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ text: "Method Not Allowed" })
  }

  let width = Number(req.query.width as string) || 256
  let height = Number(req.query.height as string) || 256
  let data = new Uint8ClampedArray(width * height * 4)

  let getFirst = <T>(key: string, parse: (v: string) => T, alt: () => T) => {
    let value = req.query[key]
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

  res.writeHead(200, {
    "Content-Type": mimeType,
    "Content-Length": buffer.length,
  })
  res.send(buffer)
}
