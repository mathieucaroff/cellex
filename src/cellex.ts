import * as React from "react"
import * as ReactDOM from "react-dom/client"

import * as packageInfo from "../package.json"
import { App } from "./App"
import { createAct } from "./control/Act"
import { createDragManager } from "./control/DragManager"
import { createInfo } from "./control/Info"
import { keyboardBinding } from "./control/KeyboardBinding"
import { createDisplay } from "./display/Display"
import { createDiffModeManager } from "./engine/DiffModeManager"
import { Engine, createAutomatonEngine } from "./engine/Engine"
import { createRandomMapper } from "./engine/RandomMapper"
import { computeTransitionNumber, interestingElementaryRuleArray } from "./engine/rule"
import { githubCornerHTML } from "./lib/githubCorner"
import { h } from "./lib/hyper"
import { parseNomenclature } from "./nomenclature/nomenclature"
import { parseTopBorder } from "./patternlang/parser"
import { createContext } from "./state/Context"
import { initialState } from "./state/state"
import { DesktopOrMobile } from "./type"
import { emitterLoop } from "./util/emitterLoop"
import { getDesktopOrMobile } from "./util/isMobile"
import { randomChoice } from "./util/randomChoice"

declare const __COMMIT_HASH__: string

function main() {
  // /\ github corner / package
  let version = `${packageInfo.version}-${__COMMIT_HASH__}`
  let cornerDiv = h("div", { innerHTML: githubCornerHTML(packageInfo.repository, version) })
  document.body.appendChild(cornerDiv)
  // \/ canvas

  let desktopOrMobile: DesktopOrMobile = getDesktopOrMobile(navigator)

  let state = initialState()
  let context = createContext(state)
  let info = createInfo(state)
  let act = createAct(context, info)

  // /\ canvas
  let displayDiv = h("div", { id: "displayDiv", tabIndex: 0 })
  let canvas = h("canvas", { className: "mainCanvas" })
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
  reactRoot.render(React.createElement(App, { act, context, info, helpList, displayDiv }))

  // /\ display
  let display = createDisplay(canvas)
  let engine: Engine

  // local display.draw method
  let drawDisplay = (redraw: boolean) => {
    display.draw(state.posS, state.posT, state.zoom, state.zoom, state.colorMap, redraw)
  }

  // engine-related change
  context
    .use(({ rule, seed, topology }) => ({ rule, seed, topology, t: JSON.stringify(topology) }))
    .for(({ rule, seed, topology }) => {
      if (rule.stateCount > state.colorMap.length) {
        console.error(
          `Cannot display rules ${rule.stateCount} states with a palette of only ${state.colorMap.length} colors`,
        )
        return
      }

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

  const handleResize = () => {
    if (state.immersiveMode === "immersive") {
      context.updateState((state) => {
        state.canvasSize = {
          width: window.innerWidth - 50,
          height: window.innerHeight - 40,
        }

        state.topology.width = state.canvasSize.width / state.zoom
      })
    }
  }

  window.addEventListener("resize", handleResize, true)
  context
    .use(({ immersiveMode }) => immersiveMode)
    .for(() => {
      setTimeout(() => {
        handleResize()
      })
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

  emitterLoop(requestAnimationFrame).link(() => {
    if (state.play) {
      context.updatePosition((position) => {
        position.posT += state.speed / state.zoom
      })
    }
  })
  context.usePosition(() => {
    drawDisplay(false)
  })
  // \/ display

  // /\ diff mode, "divine intervention"
  let diffModeManager = createDiffModeManager({ context })

  diffModeManager.addCanvas(canvas, (x, y) => {
    let s = Math.floor(
      x / state.zoom + (state.topology.width - canvas.width / state.zoom) / 2 + state.posS,
    )
    let t = Math.floor(y / state.zoom + state.posT)
    return { s, t }
  })
  // \/ diff mode

  // /\ presentation mode
  let presentationTickTimeoutId: ReturnType<typeof setTimeout>
  let presentationTick = () => {
    if (state.presentationMode !== "present") {
      return
    }

    if (state.play === false) {
      context.updateState(() => {
        state.play = true
      })
    } else {
      let oldRuleNumber = Number(computeTransitionNumber(state.rule))
      let newRuleNumber = oldRuleNumber
      while (newRuleNumber === oldRuleNumber) {
        // retry
        newRuleNumber = randomChoice(interestingElementaryRuleArray)
      }
      context.updateState(() => {
        state.rule = parseNomenclature(newRuleNumber.toString())
        state.posT = 0

        let impulseOkRuleArray = [18, 22, 26, 30, 45, 60, 62, 73, 90, 105, 110, 126, 146, 150, 154]
        if (impulseOkRuleArray.includes(newRuleNumber) && Math.random() < 0.5) {
          // impulse genesis
          state.topology.genesis = parseTopBorder("1(0)")
        } else {
          // random genesis
          state.topology.genesis = parseTopBorder("([01])")
        }
      })
    }

    presentationTickTimeoutId = setTimeout(presentationTick, 12_000)
  }

  let presentationModeWarmUpDuration = 5000
  context
    .use(({ presentationMode }) => presentationMode)
    .for((mode) => {
      clearTimeout(presentationTickTimeoutId)
      if (mode === "present") {
        presentationTickTimeoutId = setTimeout(presentationTick, presentationModeWarmUpDuration)
        presentationModeWarmUpDuration = 0
      }
    })

  if (state.presentationMode === "present") {
    const { body } = document
    // -- /\ Disable the presentation mode on the first interaction the user has with the page
    function disablePresentationMode() {
      context.updateState((state) => {
        state.presentationMode = "off"
      })
      body.removeEventListener("click", disablePresentationMode, true)
      body.removeEventListener("keydown", disablePresentationMode, true)
    }
    body.addEventListener("click", disablePresentationMode, true)
    body.addEventListener("keydown", disablePresentationMode, true)
    // -- \/
  }
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
            !["Enter", "ArrowUp", "ArrowDown"].includes(ev.key)))
      ) {
        ev.stopPropagation()
      }
    },
    true,
  )
}

main()
