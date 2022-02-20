import { Context } from "../state/context"
import { clamp } from "../util/clamp"
import { Info } from "./info"

export let createAct = (context: Context, info: Info) => {
    let action = (f) => () => {
        context.updateState(f)
    }

    let posAction = (f) => () => {
        context.updatePosition(f)
    }

    // //

    let fixLeft = () => {
        if (info.pockingLeft() && info.isBigEnough()) {
            act.gotoMaxLeft()
        }
    }
    let fixRight = () => {
        if (info.pockingRight() && info.isBigEnough()) {
            act.gotoMaxRight()
        }
    }
    let fixPosition = () => {
        if (info.isBigEnough()) {
            fixLeft()
            fixRight()
        } else {
            act.gotoCenter()
        }
    }
    let fixTop = () => {
        context.updatePosition((position) => {
            if (position.posT < 0) {
                position.posT = 0
            }
        })
    }

    let fixZoom = () => {
        let state = context.getState()
        state.zoom = clamp(state.zoom, 2, 64)
    }

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
                act.setPause()
            } else {
                act.setPlay()
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
                act.setToMinSpeed()
            }
        }),
        doubleSpeed: action((state) => {
            state.speed *= 2
            if (info.passingMaxSpeed()) {
                act.setToMaxSpeed()
            }
        }),
        decreaseSpeed: action((state) => {
            state.speed -= Math.floor(Math.sqrt(state.speed))
            if (info.passingMinSpeed()) {
                act.setToMinSpeed()
            }
        }),
        increaseSpeed: action((state) => {
            state.speed += Math.ceil(Math.sqrt(state.speed || 1))
            if (info.passingMaxSpeed()) {
                act.setToMaxSpeed()
            }
        }),
        setToMaxSpeed: action((state) => {
            state.speed = info.maxSpeed()
        }),
        setToMinSpeed: action((state) => {
            let min = info.minSpeed()
            state.speed = min
            if (min === 0) {
                act.setPause()
            }
        }),

        /********/
        /* Zoom */
        /********/

        halfZoom: action((state) => {
            state.zoom /= 2
            fixZoom()
            fixPosition()
        }),
        doubleZoom: action((state) => {
            state.zoom *= 2
            fixZoom()
            fixPosition()
        }),
        decreaseZoom: action((state) => {
            state.zoom -= Math.floor(Math.sqrt(state.speed))
            fixZoom()
            fixPosition()
        }),
        increaseZoom: action((state) => {
            state.zoom += Math.ceil(Math.sqrt(state.speed || 1))
            fixZoom()
            fixPosition()
        }),
        fixZoom: action(() => {
            fixZoom()
        }),

        /***********/
        /* Panning */
        /***********/

        /** Relative move */
        pageLeft: posAction((position) => {
            position.posS -= info.horizontalPage()
            fixPosition()
        }),
        goLeft: posAction((position) => {
            position.posS -= info.horizontalMove()
            fixPosition()
        }),
        goRight: posAction((position) => {
            position.posS += info.horizontalMove()
            fixPosition()
        }),
        pageRight: posAction((position) => {
            position.posS += info.horizontalPage()
            fixPosition()
        }),

        fixPosition: () => {
            fixPosition()
        },

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
        gotoTop: action((state) => {
            state.play = false
            state.posT = info.top()
        }),
        gotoLocation: ({ x, y }) => {
            context.updatePosition((position) => {
                position.posS = x
                fixPosition()

                if (!(position as any).play) {
                    if (y < 0) {
                        y = 0
                    }
                    position.posT = y
                }
            })
        },

        /** Width and Height */
    }
    return act
}

export type Act = ReturnType<typeof createAct>
