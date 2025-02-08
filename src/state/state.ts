import { parseColorMap } from "../display/Display"
import { randomGoodRule } from "../engine/curatedAutomata"
import { resolveSearch } from "../lib/urlParameter"
import { parseAutomaton, presentAutomaton } from "../nomenclature/nomenclature"
import { parseSideBorder, parseTopBorder } from "../patternlang/parser"
import { ImmersiveMode, State } from "../stateType"
import { getUiSizing } from "../userinterface/UserInterface"

export let oldColorMap = "#000000;#007fff;#b4b400;#7f00c8;#0aa00a;#7f1e1e;#f0b400"
export let defaultColorMap =
  "#0a0a0a;#00c3ff;#ffa700;#0100c8;#00bd00;#b60303;#ffff00;#B0B0B0;#ff57eb"

export function computeCanvasSize(window: Window, immersiveMode: ImmersiveMode) {
  let width = window.innerWidth
  let height = window.innerHeight
  if (immersiveMode === "off") {
    if (getUiSizing(window.innerWidth) === "sizeCLarge") {
      width -= 70
      height -= 150
    } else {
      height -= 100
    }
  }
  return { width, height }
}

export let initialState = (): State => {
  let param = new URLSearchParams(location.search)

  let getOr = <T>(key: string, parse: (v: string) => T, alt: () => T) => {
    if (param.has(key)) {
      try {
        return parse(param.get(key)!)
      } catch (e) {
        console.error(`Error parsing ${key} from search param: ${e}`)
      }
    }
    return alt()
  }

  return resolveSearch<State>(location, {
    automaton: [
      () =>
        getOr(
          "rule",
          (x) => x,
          () => presentAutomaton(randomGoodRule()).descriptor,
        ),
      parseAutomaton,
    ],

    speed: [() => 1],
    posS: [() => 0],
    posT: [() => 0],
    play: [() => false],
    divineMode: [() => ({ status: "off", active: false, propagation: true })],
    displayMinimap: [() => true],
    zoom: [() => 1],
    darkMode: [() => "dark"],
    immersiveMode: [() => "off"],
    presentationMode: [() => (param.has("rule") ? "off" : "present")],
    userHasInteracted: [() => false],
    colorMap: [
      () => defaultColorMap,
      (map) => {
        let colorMap = parseColorMap(map)
        let completion = parseColorMap(defaultColorMap).slice(colorMap.length)
        return [...colorMap, ...completion]
      },
    ],
    topology: [
      ({ automaton, immersiveMode }) => {
        let isElementary = automaton().neighborhoodSize === 3 && automaton().stateCount === 2
        return {
          finitness: "finite",
          kind: getOr(
            "topologyKind",
            (x) => x as any,
            () => "loop",
          ),
          width: computeCanvasSize(window, immersiveMode()).width,
          genesis: getOr("genesis", parseTopBorder, () =>
            parseTopBorder(isElementary ? "([01])" : "(0)1(0)"),
          ),
          borderLeft: getOr("borderLeft", parseSideBorder, () => parseSideBorder("(0)")),
          borderRight: getOr("borderRight", parseSideBorder, () => parseSideBorder("(0)")),
        }
      },
    ],
    history: [() => []],
    infiniteHorizontalPanning: [() => true],
    seed: [() => "_"],

    canvasSize: [({ immersiveMode }) => computeCanvasSize(window, immersiveMode())],

    galleryIsOpen: [() => false],
  })
}
