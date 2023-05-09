import "antd/dist/antd.css"
import * as ReactDOM from "react-dom"

import * as packageInfo from "../package.json"
import { createAct } from "./control/Act"
import { createInfo } from "./control/Info"
import { keyboardBinding } from "./control/KeyboardBinding"
import { createKeyboardManager } from "./control/KeyboardManager"
import { createDragManager } from "./control/dragmanager/DragManager"
import { createDisplay } from "./display/Display"
import { createDiffModeManager } from "./engine/DiffModeManager"
import { Engine, createAutomatonEngine } from "./engine/Engine"
import { createRandomMapper } from "./engine/RandomMapper"
import { interestingElementaryRuleArray, parseRule } from "./engine/rule"
import { githubCornerHTML } from "./lib/githubCorner"
import { h } from "./lib/hyper"
import { createContext } from "./state/Context"
import { defaultState } from "./state/state"
import { DesktopOrMobile } from "./type"
import { UserInterface } from "./userinterface/UserInterface"
import { emitterLoop } from "./util/emitterLoop"
import { getDesktopOrMobile } from "./util/isMobile"
import { randomChoice } from "./util/randomChoice"

function main() {
  // /\ github corner / package
  let cornerDiv = h("div", {
    innerHTML: githubCornerHTML(packageInfo.repository, packageInfo.version),
  })
  document.body.appendChild(cornerDiv)
  // \/ canvas

  let desktopOrMobile: DesktopOrMobile = getDesktopOrMobile(navigator)

  let state = defaultState()
  let context = createContext(state)
  let info = createInfo(state)
  let act = createAct(context, info)

  // /\ canvas
  let displayDiv = h("div", { tabIndex: 0 })
  let canvas = h("canvas", { className: "mainCanvas" })
  let canvasResizeHandle = h("div", { className: "canvasResizeHandle" })
  displayDiv.appendChild(canvas)
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
  displayDiv.focus()

  // /\ display
  let display = createDisplay(canvas)
  let engine: Engine

  // local display.draw method
  let drawDisplay = (redraw: boolean) => {
    display.draw(state.posS, state.posT, state.zoom, state.zoom, state.colorMap, redraw)
  }

  // engine-related change
  context
    .use(({ rule, seed, topology }) => ({ rule, seed, topology }))
    .for(({ rule, seed, topology }) => {
      let randomMapper = createRandomMapper({ seedString: seed })
      engine = createAutomatonEngine(rule, topology, randomMapper)

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
      act.fixPosition()
      drawDisplay(true)
    })

  // main canvas panning
  let panningDragManager = createDragManager({
    element: displayDiv,
    getDisplayInit: () => {
      let xy = { x: state.posS * state.zoom, y: state.posT * state.zoom }
      return xy
    },
    desktopOrMobile,
  })
  panningDragManager.onMove((xy) => {
    context.updatePosition((position, state) => {
      position.posS = xy.x / state.zoom
      act.fixPosition()
      if (!state.play) {
        position.posT = Math.max(xy.y / state.zoom, 0)
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
    let s = Math.floor(x / state.zoom + (state.topology.width - canvas.width / state.zoom) / 2)
    let t = Math.floor(y / state.zoom + state.posT)
    return { s, t }
  })
  // \/ diff mode

  // /\ presentation mode
  context.usePosition(({ posT }, { zoom }) => {
    if (state.presentationMode === "present" && posT * zoom >= state.canvasSize.height) {
      context.updateState((state) => {
        state.rule = parseRule(randomChoice(interestingElementaryRuleArray).toString())
        state.redraw = true
        state.posT = 0
      })
    }
  })
  const { body } = document
  function disablePresentationMode() {
    context.updateState((state) => {
      state.presentationMode = "off"
    })
    body.removeEventListener("click", disablePresentationMode)
    body.removeEventListener("keydown", disablePresentationMode)
  }
  body.addEventListener("click", disablePresentationMode, true)
  body.addEventListener("keydown", disablePresentationMode, true)
  // \/ presentation mode
}

main()
