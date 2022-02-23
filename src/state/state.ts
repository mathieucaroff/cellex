import { parseColorMap } from "../display/display"
import { nAryRule, parseRule } from "../engine/rule"
import { parseSideBorder, parseTopBorder } from "../patternlang/parser"
import { group, rootGroup, stochastic } from "../patternlang/patternutil"
import { State } from "../type"

export let defaultColorMap = () => {
    return [
        { red: 0, green: 0, blue: 0 }, // 0 black
        { red: 0, green: 127, blue: 255 }, // 1 blue
        { red: 180, green: 180, blue: 0 }, // 2 yellow
        { red: 127, green: 0, blue: 200 }, // 3 majenta
        { red: 10, green: 160, blue: 10 }, // 4 green
        { red: 127, green: 30, blue: 30 }, // 4 red
    ]
}

export let defaultState = (): State => {
    let param = new URLSearchParams(location.search)

    let getOr = <T>(key: string, parse: (v: string) => T, alt: () => T) => {
        return param.has(key) ? parse(param.get(key)!) : alt()
    }

    return {
        rule: getOr("rule", parseRule, nAryRule),

        speed: 1,
        posS: 0,
        posT: 0,
        play: false,
        zoom: 4,
        colorMap: defaultColorMap(),
        topology: {
            finitness: "finite",
            kind: getOr(
                "topologyKind",
                (x) => x as any,
                () => "border",
            ),
            width: adaptiveCanvasSize(window).canvasSize.width,
            genesis: getOr("genesis", parseTopBorder, () => parseTopBorder("([0001])([0111])")),
            borderLeft: getOr("borderLeft", parseSideBorder, () => parseSideBorder("011([01])")),
            borderRight: getOr("borderRight", parseSideBorder, () => parseSideBorder("011([01])")),
        },
        seed: getOr(
            "seed",
            (x) => x,
            () => "_",
        ),

        redraw: true,

        ...adaptiveCanvasSize(window),
    }
}

let adaptiveCanvasSize = (w: Window) => {
    let fullwidth = Math.ceil(w.innerWidth * 0.98 - 60)
    let width = Math.ceil(fullwidth * 0.5)
    let height = Math.ceil(Math.min(2 * width, Math.max(w.innerHeight * 0.5, 60)))
    return {
        canvasSize: { width, height },
        zoomCanvasSize: { width: fullwidth - width, height },
    }
}
