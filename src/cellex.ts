import "antd/dist/antd.css"

import * as ReactDOM from "react-dom"
import * as packageInfo from "../package.json"
import { createAct } from "./control/act"
import { createDragManager } from "./control/dragManager"
import { createInfo } from "./control/info"
import { keyboardBinding } from "./control/keyboardBinding"
import { createKeyboardManager } from "./control/keyboardManager"
import { createDisplay } from "./display/display"
import { createAutomatonEngine } from "./engine/engine"
import { createRandomMapper } from "./engine/randomMapper"
import { parseRule, ruleName } from "./engine/rule"
import { githubCornerHTML } from "./lib/githubCorner"
import { createContext } from "./state/context"
import { defaultState } from "./state/state"
import { ConfigurationPopoverButton } from "./userinterface/userinterface"
import { emitterLoop } from "./util/emitterLoop"

function main() {
    // /\ github corner / package
    let div = document.createElement("div")
    div.innerHTML = githubCornerHTML(packageInfo.repository, packageInfo.version)
    document.body.appendChild(div)
    // \/ canvas

    let state = defaultState()
    let context = createContext(state)
    let info = createInfo(state)
    let act = createAct(context, info)

    // /\ canvas
    div = document.createElement("div")
    div.tabIndex = 0
    let canvas = document.createElement("canvas")
    let zoomCanvas = document.createElement("canvas")
    document.body.appendChild(div)
    div.appendChild(canvas)
    div.appendChild(zoomCanvas)
    // \/ canvas

    // /\ control
    let keyboardBindingReference = keyboardBinding({
        act,
        keyKb: createKeyboardManager({
            element: div,
            evPropName: "key",
            capture: false,
        }),
        codeKb: createKeyboardManager({
            element: div,
            evPropName: "code",
            capture: false,
        }),
    })

    window.addEventListener("hashchange", () => {
        if (location.hash.length > 1) {
            context.updateState((state) => {
                state.rule = parseRule(location.hash.slice(1))
            })
        }
    })
    // \/ control

    // configuration, react
    ;[
        ...document.getElementsByClassName("title"),
        ...document.getElementsByClassName("subtitle"),
    ].forEach((element) => element.remove())

    let appRoot = document.getElementById("appRoot")!

    let helpList = keyboardBindingReference.getHelp()
    let span = document.createElement("span")
    appRoot.appendChild(span)
    context.usePosition(() => {
        ReactDOM.render(ConfigurationPopoverButton({ act, context, helpList }), span)
    })

    // /\ display
    let display = createDisplay(context, canvas, zoomCanvas)
    context
        .use(({ rule, seed, topology }) => ({ rule, seed, topology }))
        .for(({ rule, seed, topology }, state) => {
            let randomMapper = createRandomMapper({ seedString: seed })
            let engine = createAutomatonEngine(rule, topology, randomMapper)
            location.hash = ruleName(rule)
            display.setEngine(engine)
            display.draw(state.posS, state.posT, true)
        })

    context
        .use(({ canvasSize, zoomCanvasSize, colorMap }) => ({
            canvasSize,
            zoomCanvasSize,
            colorMap,
        }))
        .for(({ canvasSize, zoomCanvasSize }, state) => {
            canvas.width = canvasSize.width
            canvas.height = canvasSize.height
            zoomCanvas.width = zoomCanvasSize.width
            zoomCanvas.height = zoomCanvasSize.height
            display.draw(state.posS, state.posT, true)
        })

    let dragManager = createDragManager({
        element: canvas,
        getDisplayInit: () => {
            let xy = { x: state.posS, y: state.posT }
            return xy
        },
    })

    dragManager.onMove((xy) => {
        context.updatePosition((position, state) => {
            position.posS = xy.x
            act.fixPosition()
            if (!state.play) {
                position.posT = Math.max(xy.y, 0)
            }
        })
    })

    emitterLoop(requestAnimationFrame).link(() => {
        if (state.play) {
            context.updatePosition((position) => {
                position.posT += state.speed
            })
        }
    })
    context.usePosition((position) => {
        display.draw(position.posS, position.posT, position.redraw)
        position.redraw = false
    })
    // \/ display
}
main()
