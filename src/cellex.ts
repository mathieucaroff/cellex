import "antd/dist/antd.css"

import * as ReactDOM from "react-dom"
import * as packageInfo from "../package.json"
import { createAct } from "./control/Act"
import { createDragManager } from "./control/dragmanager/DragManager"
import { createDiffModeManager } from "./engine/DiffModeManager"
import { createInfo } from "./control/Info"
import { keyboardBinding } from "./control/KeyboardBinding"
import { createKeyboardManager } from "./control/KeyboardManager"
import { createDisplay } from "./display/Display"
import { createAutomatonEngine, Engine } from "./engine/Engine"
import { createRandomMapper } from "./engine/RandomMapper"
import { parseRule, ruleName } from "./engine/rule"
import { githubCornerHTML } from "./lib/githubCorner"
import { h } from "./lib/hyper"
import { presentSideBorder, presentTopBorder } from "./patternlang/presenter"
import { createContext } from "./state/Context"
import { defaultState } from "./state/state"
import { UserInterface } from "./userinterface/UserInterface"
import { emitterLoop } from "./util/emitterLoop"
import { getDesktopOrMobile } from "./util/isMobile"
import { DesktopOrMobile } from "./type"

function main() {
    // /\ github corner / package
    let cornerDiv = h("div", {
        innerHTML: githubCornerHTML(packageInfo.repository, packageInfo.version),
    })
    document.body.appendChild(cornerDiv)
    // \/ canvas

    let desktopOrMobile: DesktopOrMobile = getDesktopOrMobile(navigator.userAgent)
    console.log("desktopOrMobile_", desktopOrMobile)

    let state = defaultState()
    let context = createContext(state)
    let info = createInfo(state)
    let act = createAct(context, info)

    // /\ canvas
    let displayDiv = h("div", { tabIndex: 0 })
    let canvas = h("canvas", { className: "mainCanvas" })
    let canvasResizeHandle = h("div", { className: "canvasResizeHandle" })
    let zoomCanvas = h("canvas", { className: "zoomCanvas" })
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
    let display = createDisplay(canvas, zoomCanvas)
    let engine: Engine

    // local display.draw method
    let drawDisplay = (redraw: boolean) => {
        display.draw(state.posS, state.posT, state.zoom, state.colorMap, redraw)
        if (state.showZoomCanvasBoundary) {
            display.drawZoomAreaBoundary(state.zoom)
            state.showZoomCanvasBoundary = false
            state.redraw = true
        }
    }

    // engine-related change
    context
        .use(({ rule, seed, topology }) => ({ rule, seed, topology }))
        .for(({ rule, seed, topology }) => {
            let randomMapper = createRandomMapper({ seedString: seed })
            engine = createAutomatonEngine(rule, topology, randomMapper)

            let param = new URLSearchParams(window.location.search)
            param.set("rule", ruleName(rule))
            param.set("seed", seed)
            param.set("topologyKind", topology.kind)
            param.set("width", "" + topology.width)
            param.set("genesis", presentTopBorder(topology.genesis))
            param.set("borderLeft", presentSideBorder(topology.borderLeft))
            param.set("borderRight", presentSideBorder(topology.borderRight))
            let url = new URL(window.location.href)
            url.search = param.toString()
            window.history.pushState({}, window.document.title, url)

            display.setEngine(engine)

            drawDisplay(true)
        })

    context
        .use(({ diffMode }) => ({ diffMode }))
        .for(({ diffMode }) => {
            engine.setDiffMode(diffMode)
            drawDisplay(true)
        })

    // display-related change
    context
        .use(({ colorMap }) => ({ colorMap }))
        .for(() => {
            drawDisplay(true)
        })

    context
        .use(({ canvasSize }) => ({ canvasSize }))
        .for(({ canvasSize }) => {
            canvas.width = canvasSize.width
            canvas.height = canvasSize.height
            zoomCanvas.width = canvasSize.fullwidth - canvasSize.width
            zoomCanvas.height = canvasSize.height
            act.fixPosition()
            drawDisplay(true)
        })

    // main canvas panning
    let panningDragManager = createDragManager({
        element: displayDiv,
        getDisplayInit: () => {
            let xy = { x: state.posS, y: state.posT }
            return xy
        },
        desktopOrMobile,
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
        desktopOrMobile,
    })
    mainResizeDragManager.onMove((xy) => {
        context.updateState((state) => {
            state.canvasSize.width = -xy.x
            state.canvasSize.height = -xy.y
        })
    })

    // zoom canvas resize
    let zoomResizeDragManager = createDragManager({
        element: zoomCanvasResizeHandle,
        getDisplayInit: () => {
            let xy = { x: -state.canvasSize.fullwidth, y: -state.canvasSize.height }
            return xy
        },
        desktopOrMobile,
    })
    zoomResizeDragManager.onMove((xy) => {
        context.updateState((state) => {
            state.canvasSize.height = -xy.y
            if (xy.x > 0) {
                return
            }
            state.canvasSize.fullwidth = Math.max(state.canvasSize.width + 5, -xy.x)
        })
    })

    emitterLoop(requestAnimationFrame).link(() => {
        if (state.play) {
            context.updatePosition((position) => {
                position.posT += state.speed
            })
        }
    })
    context.usePosition(() => {
        let redraw = state.redraw
        state.redraw = false
        drawDisplay(redraw)
    })
    // \/ display

    // /\ diff mode, "divine intervention"
    let diffModeManager = createDiffModeManager({ baseDiffState: 6, context })

    diffModeManager.addCanvas(canvas, (x, y) => {
        let s = Math.floor(x)
        let t = Math.floor(y + state.posT)
        return { s, t }
    })

    diffModeManager.addCanvas(zoomCanvas, (x, y) => {
        let s = Math.floor(
            x / state.zoom + (state.topology.width - zoomCanvas.width / state.zoom) / 2,
        )
        let t = Math.floor(y / state.zoom + state.posT)
        return { s, t }
    })
    // \/ diff mode
}
main()
