import { parseColorMap } from "../display/Display"
import { randomGoodRule } from "../engine/curatedAutomata"
import { parseAutomaton } from "../nomenclature/nomenclature"
import { parseSideBorder, parseTopBorder } from "../patternlang/parser"
import { State } from "../stateType"

export let oldColorMap = "#000000;#007fff;#b4b400;#7f00c8;#0aa00a;#7f1e1e;#f0b400"
export let defaultColorMap =
  "#0a0a0a;#00c3ff;#ffa700;#0100c8;#00bd00;#b60303;#ffff00;#B0B0B0;#ff57eb"

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

    return { width, height }
  }

  let automaton = getOr("automaton", parseAutomaton, () =>
    getOr("rule", parseAutomaton, randomGoodRule),
  )
  let isElementary = automaton.neighborhoodSize === 3 && automaton.stateCount === 2
  const presentationMode = new URLSearchParams(location.search).has("rule") ? "off" : "present"

  return {
    automaton,

    speed: 1,
    posS: 0,
    posT: 0,
    play: false,
    divineMode: { status: "off", active: false, propagation: true },
    zoom: 1,
    darkMode: "dark",
    immersiveMode: "off",
    presentationMode,
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

    canvasSize: adaptiveCanvasSize(window),

    galleryIsOpen: false,
  }
}
