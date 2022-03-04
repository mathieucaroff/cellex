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
import { h } from "./lib/hyper"
import { presentSideBorder, presentTopBorder } from "./patternlang/presenter"
import { createContext } from "./state/context"
import { defaultState } from "./state/state"
import { UserInterface } from "./userinterface/userinterface"
import { emitterLoop } from "./util/emitterLoop"
import { setQueryString } from "./util/setQueryString"

function main() {
    // /\ github corner / package
    let cornerDiv = h("div", {
        innerHTML: githubCornerHTML(packageInfo.repository, packageInfo.version),
    })
    document.body.appendChild(cornerDiv)
    // \/ canvas

    let state = defaultState()
    let context = createContext(state)
    let info = createInfo(state)
    let act = createAct(context, info)

    // /\ canvas
    let displayDiv = h("div", { tabIndex: 0 })
    let canvas = h("canvas")
    let canvasResizeHandle = h("div", { className: "canvasResizeHandle" })
    let zoomCanvas = h("canvas")
    let zoomCanvasResizeHandle = h("div", { className: "zoomCanvasResizeHandle" })
    displayDiv.appendChild(canvas)
    displayDiv.appendChild(canvasResizeHandle)
    displayDiv.appendChild(zoomCanvas)
    displayDiv.appendChild(zoomCanvasResizeHandle)
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
    let span = h("span")
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

    // main canvas panning
    let panningDragManager = createDragManager({
        element: displayDiv,
        getDisplayInit: () => {
            let xy = { x: state.posS, y: state.posT }
            return xy
        },
    })
    panningDragManager.onMove((xy) => {
        context.updatePosition((position, state) => {
            position.posS = xy.x
            act.fixPosition()
            if (!state.play) {
                position.posT = Math.max(xy.y, 0)
            }
        })
    })

    // during resize, the main canvas and the zoom canvas have their height synced
    // this is because with the handles which are at the bottom right,
    // we would need canvases to be top-aligned for a comfortable experience
    // while the canvases are bottom-aligned. Also it looks better.

    // the drag manager receives negative coordinates and the onMove callback
    // negates the data it is given. This is because the use case is not a proper
    // move-content-inside-camera, but is a move-handle

    // main canvas resize
    let mainResizeDragManager = createDragManager({
        element: canvasResizeHandle,
        getDisplayInit: () => {
            let xy = { x: -state.canvasSize.width, y: -state.canvasSize.height }
            return xy
        },
    })
    mainResizeDragManager.onMove((xy) => {
        context.updateState((state) => {
            state.canvasSize.width = -xy.x
            state.canvasSize.height = -xy.y
            state.zoomCanvasSize.height = -xy.y
        })
    })

    // zoom canvas resize
    let zoomResizeDragManager = createDragManager({
        element: zoomCanvasResizeHandle,
        getDisplayInit: () => {
            let xy = { x: -state.zoomCanvasSize.width, y: -state.zoomCanvasSize.height }
            return xy
        },
    })
    zoomResizeDragManager.onMove((xy) => {
        context.updateState((state) => {
            state.zoomCanvasSize.width = -xy.x
            state.zoomCanvasSize.height = -xy.y
            state.canvasSize.height = -xy.y
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
