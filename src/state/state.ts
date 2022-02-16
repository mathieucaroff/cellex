// import { elementaryRule, nAryRule, ternaryRule } from "../engine/rule"
import { elementaryRule, nAryRule, parseRule } from "../engine/rule"
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
    ]
}

export let defaultState = (): State => {
    let random10 = stochastic([9, 10])(1, 1)
    let zer = stochastic([1])(1, 1)
    let one = stochastic([0, 1])(1, 1)
    let roz = stochastic([1, 2])(1, 1)

    return {
        rule: location.hash ? parseRule(location.hash.slice(1)) : nAryRule(),
        // theme: "dark",

        speed: 6,
        posS: 0,
        posT: 0,
        play: false,
        zoom: 1,
        colorMap: defaultColorMap(),
        // selectedSimpleGenesis: "Random 10%",
        topology: {
            finitness: "finite",
            kind: "border",
            width: canvasSizeAdvice(window).width,
            genesis: {
                center: rootGroup([one]),
                cycleLeft: rootGroup([zer]),
                cycleRight: rootGroup([zer]),
            },
            borderLeft: {
                init: rootGroup([group([zer])(1)]),
                cycle: rootGroup([roz]),
            },
            borderRight: {
                init: rootGroup([group([zer])(1)]),
                cycle: rootGroup([roz]),
            },
        },
        seed: "_",

        redraw: false,

        // MDisplay
        canvasSize: canvasSizeAdvice(window),
    }
}

let canvasSizeAdvice = (w: Window): Size => {
    let fx = w.innerWidth * 0.99
    let fy = Math.max(w.innerHeight * 0.95 - 120, 60)
    let width = Math.ceil(fx)
    let height = Math.ceil(Math.min(width, fy))
    return { width, height }
}
