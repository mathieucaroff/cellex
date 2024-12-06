import posthog from "posthog-js"
import * as React from "react"
import * as ReactDOM from "react-dom/client"

import { App } from "./App"
import { createAct } from "./control/Act"
import { createDragManager } from "./control/DragManager"
import { createInfo } from "./control/Info"
import { keyboardBinding } from "./control/KeyboardBinding"
import { createDisplay } from "./display/Display"
import { createMinimap } from "./display/Minimap"
import { createDivineModeManager } from "./engine/DivineModeManager"
import { createAutomatonEngine } from "./engine/Engine"
import { computeTransitionNumber, interestingElementaryRuleArray } from "./engine/curatedAutomata"
import { Engine } from "./engineType"
import { h } from "./lib/hyper"
import { parseAutomaton } from "./nomenclature/nomenclature"
import { parseTopBorder } from "./patternlang/parser"
import { createContext } from "./state/Context"
import { createSafeStateWriter } from "./state/SafeStateWriter"
import { initialState } from "./state/state"
import { ImmersiveMode, State } from "./stateType"
import { DesktopOrMobile } from "./type"
import { getUiSizing } from "./userinterface/UserInterface"
import { emitterLoop } from "./util/emitterLoop"
import { getDesktopOrMobile } from "./util/isMobile"
import { randomChoice } from "./util/randomChoice"

declare const __POSTHOG_API_KEY__: string

function main() {
  if (__POSTHOG_API_KEY__) {
    posthog.init(__POSTHOG_API_KEY__, {
      api_host: "https://eu.i.posthog.com",
      person_profiles: "always",
    })
  }

  let desktopOrMobile: DesktopOrMobile = getDesktopOrMobile(navigator)

  let state = initialState()
  console.log("initial state", state)

  let info = createInfo(state)
  let safeStateWriter = createSafeStateWriter(state, info)
  let context = createContext(state, safeStateWriter)
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

  let shortcutList = keyboardBindingReference.getHelp()

  let reactRoot = ReactDOM.createRoot(document.getElementById("appRoot")!)
  reactRoot.render(
    React.createElement(App, { act, context, info, shortcutList, displayDiv }, []) as any,
  )

  // /\ display
  let display = createDisplay(canvas)
  let engine: Engine

  // local display.draw method
  let drawDisplay = (redraw: boolean) => {
    display.draw(
      state.posS,
      state.posT,
      state.zoom,
      state.zoom,
      state.colorMap,
      state.infiniteHorizontalPanning,
      redraw,
    )
  }

  // engine-related change
  context
    .use(({ automaton, seed, topology }) => ({
      automaton,
      seed,
      topology,
      t: JSON.stringify(topology),
    }))
    .for(({ automaton, seed, topology }) => {
      engine = createAutomatonEngine({
        automaton,
        topology,
        seed,
        interventionColorIndex: state.colorMap.length - 1,
      })
      act.setDivineModeOff(state)

      display.setEngine(engine)

      drawDisplay(true)
    })

  context
    .use(({ divineMode }) => ({ divineMode }))
    .for(({ divineMode }) => {
      if (divineMode.active) {
        canvas.classList.add("divineMode")
      } else {
        canvas.classList.remove("divineMode")
      }
      engine.setDivineMode(divineMode)
      drawDisplay(true)
    })

  // display-related change
  context
    .use(({ colorMap }) => ({ colorMap }))
    .for(() => {
      drawDisplay(true)
    })

  context
    .use(
      ({ canvasSize, infiniteHorizontalPanning }) =>
        [canvasSize, infiniteHorizontalPanning] as const,
    )
    .for(([canvasSize]) => {
      canvas.width = canvasSize.width
      canvas.height = canvasSize.height
      let ctx = canvas.getContext("2d")
      ;(ctx as any).imageSmoothingEnabled = false
      act.fixPosition()
      drawDisplay(true)
    })

  const updateCanvasSizeAndTopologyWidth = (immersiveMode: ImmersiveMode) => {
    context.updateState((state) => {
      autosetCanvasSize(state, immersiveMode)
      const newWidth = Math.floor(state.canvasSize.width / state.zoom)
      if (
        immersiveMode === "immersive"
          ? newWidth > state.topology.width
          : newWidth < state.topology.width
      ) {
        state.topology.width = newWidth
      }
    })
  }

  const handleResize = () => {
    let uiMode = getUiSizing(window.innerWidth)
    document.documentElement.classList.add(uiMode)
    ;["desktop", "tablet", "phone"].forEach((mode) => {
      if (mode !== uiMode) {
        document.documentElement.classList.remove(mode)
      }
    })

    if (state.immersiveMode === "immersive") {
      updateCanvasSizeAndTopologyWidth("immersive")
    } else {
      context.updateState((state) => {
        autosetCanvasSize(state, "off")
      })
    }
  }

  window.addEventListener("resize", handleResize, true)
  context
    .use(({ immersiveMode }) => immersiveMode)
    .for((immersiveMode) => {
      if (immersiveMode === "immersive") {
        document.documentElement.requestFullscreen().then(() => {
          document.documentElement.classList.add("immersive")
          displayDiv.focus()
        })
      } else if (document.documentElement.classList.contains("immersive")) {
        document.documentElement.classList.remove("immersive")
        document.exitFullscreen().then(() => {
          displayDiv.focus()
        })
      }

      setTimeout(() => {
        if (immersiveMode === "off") {
          updateCanvasSizeAndTopologyWidth("off")
        }
        handleResize()
      })
    })

  window.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement === null) {
      context.updateState((state) => {
        state.immersiveMode = "off"
      })
    }
  })

  // main canvas panning
  let panningDragManager = createDragManager({
    element: displayDiv,
    getDisplayInit: () => {
      let xy = { x: state.posS * state.zoom, y: state.posT * state.zoom }
      return xy
    },
    desktopOrMobile,
    window,
  })
  panningDragManager.onMove((xy) => {
    context.updatePosition((position, state) => {
      safeStateWriter.setPosS(xy.x / state.zoom)
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

  // /\ minimap
  let minimap = createMinimap({
    rootElement: displayDiv,
    context,
  })
  // \/ minimap

  // /\ divine mode, "divine intervention"
  let divineModeManager = createDivineModeManager({ context })

  divineModeManager.addCanvas(canvas, (x, y) => {
    let rawS =
      x / state.zoom +
      state.posS +
      state.topology.width / 2 -
      Math.ceil(canvas.width / state.zoom / 2)
    let s = Math.floor(rawS)
    let t = Math.floor(y / state.zoom + state.posT)
    return { s, t }
  })
  // \/ divine mode

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
      if (state.automaton.kind !== "tableRule" && state.automaton.kind !== "tableCode") {
        context.updateState(() => {
          state.presentationMode = "off"
        })
        return
      }
      let oldRuleNumber = Number(computeTransitionNumber(state.automaton))
      let newRuleNumber = oldRuleNumber
      while (newRuleNumber === oldRuleNumber) {
        // retry
        newRuleNumber = randomChoice(interestingElementaryRuleArray)
      }
      context.updateState(() => {
        state.automaton = parseAutomaton(newRuleNumber.toString())
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
        state.userHasInteracted = true
      })
      body.removeEventListener("mousedown", disablePresentationMode, true)
      body.removeEventListener("keydown", disablePresentationMode, true)
    }
    body.addEventListener("mousedown", disablePresentationMode, true)
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

  function autosetCanvasSize(state: State, immersiveMode: ImmersiveMode) {
    state.canvasSize = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    if (immersiveMode === "off" && getUiSizing(window.innerWidth) !== "sizeASmall") {
      state.canvasSize.width -= 70
      state.canvasSize.height -= 150
    }
  }
}

main()
