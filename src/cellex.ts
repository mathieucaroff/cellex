import { ConfigProvider, theme as antdTheme } from "antd"
import * as React from "react"
import * as ReactDOM from "react-dom/client"

import * as packageInfo from "../package.json"
import { createAct } from "./control/Act"
import { createInfo } from "./control/Info"
import { keyboardBinding } from "./control/KeyboardBinding"
import { createDragManager } from "./control/dragmanager/DragManager"
import { createDisplay } from "./display/Display"
import { createDiffModeManager } from "./engine/DiffModeManager"
import { Engine, createAutomatonEngine } from "./engine/Engine"
import { createRandomMapper } from "./engine/RandomMapper"
import { interestingElementaryRuleArray } from "./engine/rule"
import { githubCornerHTML } from "./lib/githubCorner"
import { h } from "./lib/hyper"
import { parseNomenclature } from "./nomenclature/nomenclature"
import { createContext } from "./state/Context"
import { ReactContext } from "./state/ReactContext"
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
  let displayDiv = h("div", { id: "displayDiv", tabIndex: 0 })
  let canvas = h("canvas", { className: "mainCanvas" })
  let canvasResizeHandle = h("div", { className: "canvasResizeHandle" })
  displayDiv.appendChild(canvas)
  setTimeout(() => {
    displayDiv.focus()
  })
  // \/ canvas

  // /\ control
  let keyboardBindingReference = keyboardBinding({
    act,
    globalElement: document.documentElement,
    specificElement: displayDiv,
  })

  window.addEventListener("hashchange", () => {
    if (location.hash.length > 1) {
      context.updateState((state) => {
        state.rule = parseNomenclature(location.hash.slice(1))
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

  let reactRoot = ReactDOM.createRoot(span)
  reactRoot.render(
    React.createElement(
      ReactContext.Provider,
      { value: { act, context } },
      React.createElement(
        ConfigProvider,
        { theme: { algorithm: [antdTheme.darkAlgorithm] } },
        React.createElement(UserInterface, { helpList, displayDiv }),
      ),
    ),
  )

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
      let ctx = canvas.getContext("2d")
      ;(ctx as any).imageSmoothingEnabled = false
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
        position.posT += state.speed / state.zoom
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
        state.rule = parseNomenclature(randomChoice(interestingElementaryRuleArray).toString())
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
    body.removeEventListener("click", disablePresentationMode, true)
    body.removeEventListener("keydown", disablePresentationMode, true)
  }
  body.addEventListener("click", disablePresentationMode, true)
  body.addEventListener("keydown", disablePresentationMode, true)
  // \/ presentation mode

  // prevent shortcuts from interfering with typing in text inputs or textareas
  document.documentElement.addEventListener(
    "keydown",
    (ev) => {
      if (
        ev.target &&
        (ev.target instanceof HTMLTextAreaElement ||
          (ev.target instanceof HTMLInputElement &&
            (!ev.target.type || ev.target.type === "text") &&
            ev.key !== "Enter"))
      ) {
        ev.stopPropagation()
      }
    },
    true,
  )
}

main()
