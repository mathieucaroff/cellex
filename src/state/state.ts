import { nAryRule, parseRule } from "../engine/rule"
import { group, rootGroup, stochastic } from "../patternlang/patternutil"
import { Size, State } from "../type"

export let defaultColorMap = () => {
    return [
        { red: 0, green: 0, blue: 0 }, // 0 black
        { red: 0, green: 127, blue: 200 }, // 1 blue
        { red: 127, green: 127, blue: 0 }, // 2 yellow
        { red: 160, green: 0, blue: 0 }, // 3 red
        { red: 0, green: 160, blue: 0 }, // 4 green
        { red: 127, green: 0, blue: 200 }, // 5 majenta
        { red: 127, green: 127, blue: 127 }, // 6 grey
        { red: 255, green: 255, blue: 255 }, // 7 white
    ]
}

export let defaultState = (): State => {
    let random10 = stochastic([9, 10])(1, 1)
    let z = stochastic([1])(1, 1)
    let i = stochastic([0, 1])(1, 1)
    let roz = stochastic([1, 2])(1, 1)

    return {
        rule: location.hash ? parseRule(location.hash.slice(1)) : nAryRule(),
        // theme: "dark",

        speed: 1,
        posS: 0,
        posT: 0,
        play: false,
        zoom: 4,
        colorMap: defaultColorMap(),
        // selectedSimpleGenesis: "Random 10%",
        topology: {
            finitness: "finite",
            kind: "border",
            width: canvasSizeAdvice(window).canvasSize.width,
            genesis: {
                center: rootGroup([i]),
                cycleLeft: rootGroup([z]),
                cycleRight: rootGroup([z]),
            },
            borderLeft: {
                init: rootGroup([group([z])(1)]),
                cycle: rootGroup([roz]),
            },
            borderRight: {
                init: rootGroup([group([z])(1)]),
                cycle: rootGroup([roz]),
            },
        },
        seed: "_",

        redraw: true,

        // MDisplay
        ...canvasSizeAdvice(window),
    }
}

let canvasSizeAdvice = (w: Window) => {
    let fullwidth = Math.ceil(w.innerWidth * 0.98)
    let width = Math.ceil(fullwidth * 0.5)
    let height = Math.ceil(Math.min(2 * width, Math.max(w.innerHeight * 0.95 - 120, 60)))
    return {
        canvasSize: { width, height },
        zoomCanvasSize: { width: fullwidth - width, height },
    }
}
