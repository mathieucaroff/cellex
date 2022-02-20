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
import { presentSideBorder, presentTopBorder } from "./patternlang/presenter"
import { createContext } from "./state/context"
import { defaultState } from "./state/state"
import { UserInterface } from "./userinterface/userinterface"
import { emitterLoop } from "./util/emitterLoop"
import { setQueryString } from "./util/setQueryString"

function main() {
    // /\ github corner / package
    let cornerDiv = document.createElement("div")
    cornerDiv.innerHTML = githubCornerHTML(packageInfo.repository, packageInfo.version)
    document.body.appendChild(cornerDiv)
    // \/ canvas

    let state = defaultState()
    let context = createContext(state)
    let info = createInfo(state)
    let act = createAct(context, info)

    // /\ canvas
    let displayDiv = document.createElement("div")
    displayDiv.tabIndex = 0
    let canvas = document.createElement("canvas")
    let zoomCanvas = document.createElement("canvas")
    // document.body.appendChild(displayDiv)
    displayDiv.appendChild(canvas)
    displayDiv.appendChild(zoomCanvas)
    // \/ canvas

    // /\ control
    let keyboardBindingReference = keyboardBinding({
        act,
        keyKb: createKeyboardManager({
            element: displayDiv,
            evPropName: "key",
            capture: false,
        }),
        codeKb: createKeyboardManager({
            element: displayDiv,
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
        ReactDOM.render(UserInterface({ act, context, helpList, displayDiv }), span)
    })

    // /\ display
    let display = createDisplay(context, canvas, zoomCanvas)
    context
        .use(({ rule, seed, topology }) => ({ rule, seed, topology }))
        .for(({ rule, seed, topology }, state) => {
            let randomMapper = createRandomMapper({ seedString: seed })
            let engine = createAutomatonEngine(rule, topology, randomMapper)
            setQueryString(window, "rule", ruleName(rule))
            setQueryString(window, "seed", seed)
            setQueryString(window, "topologyKind", topology.kind)
            setQueryString(window, "genesis", presentTopBorder(topology.genesis))
            setQueryString(window, "borderLeft", presentSideBorder(topology.borderLeft))
            setQueryString(window, "borderRight", presentSideBorder(topology.borderRight))
            display.setEngine(engine)
            display.draw(state.posS, state.posT, true)
        })

    context
        .use(({ canvasSize, zoomCanvasSize, colorMap }) => ({
            canvasSize,
            zoomCanvasSize,
            colorMap,
        }))
        .for(({ canvasSize, zoomCanvasSize, colorMap }, state) => {
            canvas.width = canvasSize.width
            canvas.height = canvasSize.height
            zoomCanvas.width = zoomCanvasSize.width
            zoomCanvas.height = zoomCanvasSize.height
            display.draw(state.posS, state.posT, true)
        })

    let dragManager = createDragManager({
        element: displayDiv,
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
