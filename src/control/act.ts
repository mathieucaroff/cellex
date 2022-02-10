import { Context } from "../state/context"
import { Info } from "./info"

export let createAct = (context: Context, info: Info) => {
    let action = (f) => () => {
        context.updateState(f)
    }

    let posAction = (f) => () => {
        context.updatePosition(f)
    }

    // //

    let isBigEnough = () => info.maxLeft() <= info.maxRight()
    let fixLeft = () => {
        if (info.pockingLeft() && isBigEnough()) {
            act.gotoMaxLeft()
        }
    }
    let fixRight = () => {
        if (info.pockingRight() && isBigEnough()) {
            act.gotoMaxRight()
        }
    }
    let fixPosition = () => {
        if (isBigEnough()) {
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
        context.updateState((state) => {
            if (state.zoom > 256) {
                state.zoom = 256
            } else if (state.zoom < 4) {
                state.zoom = 4
            } else if (Math.log2(state.zoom) % 1 > 0) {
                state.zoom = 2 ** Math.floor(Math.log2(state.zoom))
            }
        })
    }

    let act = {
        /****************/
        /* Play / Pause */
        /****************/
        setPlay: action((state) => {
            state.play = true
        }),
        setPause: action((state) => {
            state.play = false
        }),
        togglePlay: action((state) => {
            state.play = !state.play
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
            state.speed += Math.ceil(Math.sqrt(state.speed))
            if (info.passingMaxSpeed()) {
                act.setToMaxSpeed()
            }
        }),
        setToMaxSpeed: action((state) => {
            state.speed = info.maxSpeed()
        }),
        setToMinSpeed: action((state) => {
            state.speed = info.minSpeed()
        }),

        /********/
        /* Zoom */
        /********/

        increaseZoom: action((state) => {
            state.zoom *= 2
            fixZoom()
            fixPosition()
        }),
        decreaseZoom: action((state) => {
            state.zoom /= 2
            fixZoom()
            fixPosition()
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
    }
    return act
}

export type Act = ReturnType<typeof createAct>
