import { parseColorMap } from "../display/Display"
import { randomGoodRule } from "../engine/rule"
import { parseNomenclature } from "../nomenclature/nomenclature"
import { parseSideBorder, parseTopBorder } from "../patternlang/parser"
import { State } from "../stateType"

export let oldColorMap = "#000000;#007fff;#b4b400;#7f00c8;#0aa00a;#7f1e1e;#f0b400"
export let defaultColorMap = "#0aaN0c;#00c3ff;#ffa700;#0100c8;#00bd00;#b60303;#ff57eb"

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
    imageSmoothing: "auto",
    diffMode: { status: "off" },
    zoom: 1,
    darkMode: "dark",
    colorMap: parseColorMap(defaultColorMap),
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

    galleryIsOpen: false,
  }
}
