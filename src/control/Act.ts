import { parseSideBorder, parseTopBorder } from "../patternlang/parser"
import { Context } from "../state/Context"
import { State } from "../stateType"
import { clamp } from "../util/clamp"
import { randomSeed } from "../util/randomSeed"
import { Info } from "./Info"

export let createAct = (context: Context, info: Info) => {
  let action = (f: (state: State) => void) => (state?: State) => {
    if (state) {
      f(state)
    } else {
      context.updateState(f)
    }
  }

  let posAction = (f: (position: State, state: State) => void) => (position?: State) => {
    if (position) {
      f(position, position)
    } else {
      context.updatePosition(f as any)
    }
  }

  // //

  let fixLeft = posAction((position) => {
    if (info.zoomedSimulationIsBiggerThanCanvas()) {
      position.posS = Math.max(position.posS, info.maxLeft())
    }
  })
  let fixRight = posAction((position) => {
    if (info.zoomedSimulationIsBiggerThanCanvas()) {
      position.posS = Math.min(position.posS, info.maxRight())
    }
  })
  let fixPosition = posAction((position) => {
    if (info.zoomedSimulationIsBiggerThanCanvas()) {
      fixLeft(position)
      fixRight(position)
    } else {
      position.posS = info.center()
    }
  })
  let fixTop = posAction((position) => {
    if (position.posT < 0) {
      position.posT = 0
    }
  })

  let fixZoom = action((state) => {
    state.zoom = clamp(state.zoom, 0.25, 64)
  })

  let act = {
    /****************/
    /* Play / Pause */
    /****************/
    setPlay: action((state) => {
      state.play = true
      if (state.speed === 0) {
        state.speed = 1
      }
    }),
    setPause: action((state) => {
      state.play = false
    }),
    togglePlay: action((state) => {
      if (state.play) {
        act.setPause(state)
      } else {
        act.setPlay(state)
      }
    }),
    singleStep: action((state) => {
      state.play = false
      state.posT += 1
    }),

    /********************/
    /* Autoscroll speed */
    /********************/
    halfSpeed: action((state) => {
      state.speed /= 2
    }),
    doubleSpeed: action((state) => {
      state.speed *= 2
      if (info.passingMaxSpeed()) {
        act.setToMaxSpeed(state)
      } else if (info.passingMinSpeed()) {
        act.setToMinSpeed(state)
      }
    }),
    decreaseSpeed: action((state) => {
      state.speed -= Math.floor(Math.sqrt(state.speed))
      if (info.passingMinSpeed()) {
        act.setToMinSpeed(state)
      }
    }),
    increaseSpeed: action((state) => {
      state.speed += Math.ceil(Math.sqrt(state.speed || 1))
      if (info.passingMaxSpeed()) {
        act.setToMaxSpeed(state)
      }
    }),
    setToMaxSpeed: action((state) => {
      state.speed = info.maxSpeed()
    }),
    setToMinSpeed: action((state) => {
      let min = info.minSpeed()
      state.speed = min
      if (min === 0) {
        act.setPause(state)
      }
    }),

    /********/
    /* Zoom */
    /********/

    halfZoom: action((state) => {
      state.zoom /= 2
      fixZoom(state)
      fixPosition(state)
    }),
    doubleZoom: action((state) => {
      state.zoom *= 2
      fixZoom(state)
      fixPosition(state)
    }),
    decreaseZoom: action((state) => {
      state.zoom -= Math.floor(Math.sqrt(state.zoom))
      fixZoom(state)
      fixPosition(state)
    }),
    increaseZoom: action((state) => {
      state.zoom += Math.ceil(Math.sqrt(state.zoom || 1))
      fixZoom(state)
      fixPosition(state)
    }),
    fixZoom,

    /***********/
    /* Panning */
    /***********/

    /** Relative move */
    pageLeft: posAction((position) => {
      position.posS -= info.horizontalPage()
      fixPosition(position)
    }),
    goLeft: posAction((position) => {
      position.posS -= info.horizontalMove()
      fixPosition(position)
    }),
    goRight: posAction((position) => {
      position.posS += info.horizontalMove()
      fixPosition(position)
    }),
    pageRight: posAction((position) => {
      position.posS += info.horizontalPage()
      fixPosition(position)
    }),

    fixPosition,

    /** Goto */
    gotoMaxLeft: posAction((position) => {
      position.posS = info.maxLeft()
      fixPosition(position)
    }),
    gotoCenter: posAction((position) => {
      position.posS = info.center()
      fixPosition(position)
    }),
    gotoMaxRight: posAction((position) => {
      position.posS = info.maxRight()
      fixPosition(position)
    }),

    /** Relative move */
    pageUp: posAction((position) => {
      position.posT -= info.verticalPage()
      fixTop()
    }),
    goUp: posAction((position) => {
      position.posT -= info.verticalMove()
      fixTop()
    }),
    goDown: posAction((position) => {
      position.posT += info.verticalMove()
    }),
    pageDown: posAction((position) => {
      position.posT += info.verticalPage()
    }),

    /** Goto */
    gotoTop: posAction((state) => {
      state.play = false
      state.posT = info.top()
    }),
    gotoLocation: ({ x, y }) => {
      context.updatePosition((position) => {
        position.posS = x
        fixPosition(position as any)

        if (!(position as any).play) {
          if (y < 0) {
            y = 0
          }
          position.posT = y
        }
      })
    },

    /** Focus */
    focus: (id: string) => () => {
      document.querySelector<HTMLElement>(id)?.focus()
    },
    select: (id: string) => () => {
      document.querySelector<HTMLInputElement>(id)?.select()
    },

    /** Differential Mode */
    nextDifferentialMode: action((state) => {
      if (state.diffMode.status === "off") {
        state.diffMode = { status: "waiting", active: false, divine: false }
      } else if (!state.diffMode.divine) {
        state.diffMode = { status: "waiting", active: false, divine: true }
      } else {
        state.diffMode = { status: "off", active: false }
      }
    }),

    /** Immersive Mode */
    toggleImmersiveMode: action((state) => {
      state.immersiveMode = state.immersiveMode === "off" ? "immersive" : "off"
    }),

    handlePressEscape: action((state) => {
      state.immersiveMode = "off"
    }),

    /** Gallery */

    toggleGallery: action((state) => {
      state.galleryIsOpen = !state.galleryIsOpen
    }),

    /** Quick settings */
    backspace: action((state) => {
      act.setPause(state)
      act.gotoTop(state)
      document.querySelector<HTMLInputElement>("#automatonInput")!.select()
    }),
    setGenesis: (genesis: string) =>
      action((state) => {
        state.topology.kind = "loop"
        state.topology.genesis = parseTopBorder(genesis)
        state.topology.borderLeft = parseSideBorder("(0)")
        state.topology.borderRight = parseSideBorder("(0)")
      }),
    setRandomGenesis: (genesis: string) =>
      action((state) => {
        state.topology.genesis = parseTopBorder(genesis)
        state.seed = randomSeed()
      }),
    randomizeSeed: action((state) => {
      state.seed = randomSeed()
    }),
  }
  return act
}

export type Act = ReturnType<typeof createAct>
