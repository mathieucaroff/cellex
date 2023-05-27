import { randomGoodRule } from "../engine/rule"
import { parseNomenclature } from "../nomenclature/nomenclature"
import { parseSideBorder, parseTopBorder } from "../patternlang/parser"
import { State } from "../stateType"

export let defaultColorMap = () => {
  return [
    { red: 0, green: 0, blue: 0 }, // 0 black
    { red: 0, green: 127, blue: 255 }, // 1 blue
    { red: 180, green: 180, blue: 0 }, // 2 yellow
    { red: 127, green: 0, blue: 200 }, // 3 majenta
    { red: 10, green: 160, blue: 10 }, // 4 green
    { red: 127, green: 30, blue: 30 }, // 5 red
    { red: 240, green: 180, blue: 0 }, // 6 orange
  ]
}

export let initialState = (): State => {
  let param = new URLSearchParams(location.search)

  let getOr = <T>(key: string, parse: (v: string) => T, alt: () => T) => {
    if (param.has(key)) {
      try {
        return parse(param.get(key)!)
      } catch {}
    } else {
      return alt()
    }
  }

  let adaptiveCanvasSize = (w: Window) => {
    let width = getOr<number>(
      "width",
      (x) => +x,
      () => w.innerWidth - 70,
    )
    let height = w.innerHeight - 150

    if (param.has("width")) {
      width = +param.get("width")!
    }

    return { width, height }
  }

  let rule = getOr("rule", parseNomenclature, randomGoodRule)
  let isElementary = rule.neighborhoodSize === 3 && rule.stateCount === 2
  const presentationMode = new URLSearchParams(location.search).has("rule") ? "off" : "present"

  return {
    rule,

    speed: 1,
    posS: 0,
    posT: 0,
    play: false,
    presentationMode,
    diffMode: { status: "off" },
    zoom: 1,
    darkMode: "dark",
    colorMap: defaultColorMap(),
    topology: {
      finitness: "finite",
      kind: getOr(
        "topologyKind",
        (x) => x as any,
        () => "loop",
      ),
      width: adaptiveCanvasSize(window).width,
      genesis: getOr("genesis", parseTopBorder, () =>
        parseTopBorder(isElementary ? "([01])" : "(0)1(0)"),
      ),
      borderLeft: getOr("borderLeft", parseSideBorder, () => parseSideBorder("(0)")),
      borderRight: getOr("borderRight", parseSideBorder, () => parseSideBorder("(0)")),
    },
    seed: getOr(
      "seed",
      (x) => x,
      () => "_",
    ),

    redraw: false,

    canvasSize: adaptiveCanvasSize(window),
  }
}
