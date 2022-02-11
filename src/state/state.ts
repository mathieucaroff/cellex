// import { elementaryRule, nAryRule, ternaryRule } from "../engine/rule"
import { elementaryRule, nAryRule, parseRule } from "../engine/rule"
import { Size, State } from "../type"

export let defaultState = (): State => {
    let random10 = {
        cumulativeMap: [9, 10],
        total: 10,
    }
    let zer = {
        cumulativeMap: [1, 1],
        total: 1,
    }
    let one = {
        cumulativeMap: [0, 1],
        total: 1,
    }
    let roz = {
        cumulativeMap: [1, 2],
        total: 2,
    }

    return {
        rule: location.hash ? parseRule(location.hash.slice(1)) : nAryRule(),
        // theme: "dark",

        speed: 6,
        posS: 0,
        posT: 0,
        play: false,
        zoom: 1,
        // selectedSimpleGenesis: "Random 10%",
        topology: {
            finitness: "finite",
            kind: "border",
            width: 1800,
            genesis: {
                kind: "top",
                center: [one],
                // cycleLeft: [one, zer, zer, zer, zer, zer, one, zer, one, zer, one, one], // 0
                // cycleLeft: [one, zer, zer, zer], // 0
                // cycleRight: [one, zer, zer, zer], // 0
                cycleLeft: [zer], // 0
                cycleRight: [zer], // 0
                // cycleRight: [{ cumulativeMap: [9, 10], total: 10 }],
                // center: [],
                // cycleLeft: [random10],
                // cycleRight: [random10],
            },
            borderLeft: { kind: "side", init: [], cycle: [roz] },
            borderRight: { kind: "side", init: [], cycle: [roz] },
        },
        seed: "_",

        redraw: true,

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
