import { Context } from "../state/Context"
import { State } from "../type"
import { clamp } from "../util/clamp"
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
        if (info.pockingLeft() && info.isBigEnough()) {
            position.posS = info.maxLeft()
        }
    })
    let fixRight = posAction((position) => {
        if (info.pockingRight() && info.isBigEnough()) {
            position.posS = info.maxRight()
        }
    })
    let fixPosition = posAction((position) => {
        if (info.isBigEnough()) {
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
        state.zoom = clamp(state.zoom, 2, 64)
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
            if (info.passingMinSpeed()) {
                act.setToMinSpeed(state)
            }
        }),
        doubleSpeed: action((state) => {
            state.speed *= 2
            if (info.passingMaxSpeed()) {
                act.setToMaxSpeed(state)
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
            fixPosition()
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
        }),
        gotoCenter: posAction((position) => {
            position.posS = info.center()
        }),
        gotoMaxRight: posAction((position) => {
            position.posS = info.maxRight()
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

        /** Differential Mode */
        toggleDifferentialMode: action((state) => {
            if (state.diffMode === "off") {
                state.diffMode = {
                    t: 0,
                    s: [] as number[],
                    diffState: 6,
                }
            } else {
                state.diffMode = "off"
            }
        }),
    }
    return act
}

export type Act = ReturnType<typeof createAct>
