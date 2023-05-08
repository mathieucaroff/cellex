import { nAryRule, parseRule } from "../engine/rule"
import { parseSideBorder, parseTopBorder } from "../patternlang/parser"
import { State } from "../type"

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

export let defaultState = (): State => {
  let param = new URLSearchParams(location.search)

  let getOr = <T>(key: string, parse: (v: string) => T, alt: () => T) => {
    return param.has(key) ? parse(param.get(key)!) : alt()
  }

  let adaptiveCanvasSize = (w: Window) => {
    let width = getOr<number>(
      "width",
      (x) => +x,
      () => w.innerWidth - 40,
    )
    let height = w.innerHeight - 150

    if (param.has("width")) {
      width = +param.get("width")!
    }

    return { width, height }
  }

  return {
    rule: getOr("rule", parseRule, nAryRule),

    speed: 1,
    posS: 0,
    posT: 0,
    play: true,
    presentationMode: "present",
    diffMode: { status: "off" },
    zoom: 4,
    colorMap: defaultColorMap(),
    topology: {
      finitness: "finite",
      kind: getOr(
        "topologyKind",
        (x) => x as any,
        () => "border",
      ),
      width: adaptiveCanvasSize(window).width,
      genesis: getOr("genesis", parseTopBorder, () => parseTopBorder("([0001])([0111])")),
      borderLeft: getOr("borderLeft", parseSideBorder, () => parseSideBorder("011([01])")),
      borderRight: getOr("borderRight", parseSideBorder, () => parseSideBorder("011([01])")),
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
