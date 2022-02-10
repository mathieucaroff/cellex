import { State } from "../type"

export interface Info {
    minSpeed(): number
    maxSpeed(): number
    passingMinSpeed(): boolean
    passingMaxSpeed(): boolean

    horizontalPage(): number
    horizontalMove(): number
    maxLeft(): number
    maxRight(): number
    center(): number
    pockingLeft(): boolean
    pockingRight(): boolean

    atLeftBorder(): boolean
    atRightBorder(): boolean
    atCenter(): boolean
    passingLeftBorder(): boolean
    passingRightBorder(): boolean

    verticalPage(): number
    verticalMove(): number
    top(): number

    atTop(): boolean
    passingTop(): boolean
}

export let createInfo = (state: State): Info => {
    let info = {
        /*****************/
        /* Autoscrolling */
        /*****************/
        /** Speed */
        minSpeed() {
            return 1
        },
        maxSpeed() {
            return 256
        },
        passingMinSpeed() {
            return state.speed <= info.minSpeed()
        },
        passingMaxSpeed() {
            return state.speed >= info.maxSpeed()
        },

        /***********/
        /* Panning */
        /***********/
        /** ** Horizontal ** **/
        /** Sizes */
        horizontalPage() {
            // todo
            return Math.floor((state.posS % 1) * (state.canvasSize.width / state.zoom))
        },
        horizontalMove() {
            return Math.floor(info.horizontalPage() / 12)
        },

        /** Positions */
        maxLeft() {
            return 0
        },
        maxRight() {
            // todo
            let pixel6 = state.topology.width * state.zoom
            let difference = pixel6 - state.canvasSize.width * 6
            let right = Math.floor((difference * (state.posS % 1)) / state.zoom)
            return right
        },
        center() {
            return Math.floor((info.maxLeft() + info.maxRight()) / 2)
        },
        /** Position tests */
        pockingLeft() {
            return state.posS < info.maxLeft()
        },
        pockingRight() {
            return state.posS > info.maxRight()
        },

        /** Boolean indicators */
        atLeftBorder() {
            return state.posS === info.maxLeft()
        },
        atRightBorder() {
            return state.posS === info.maxRight()
        },
        atCenter() {
            return state.posS === info.center()
        },
        passingLeftBorder() {
            return state.posS <= info.maxLeft()
        },
        passingRightBorder() {
            return state.posS >= info.maxRight()
        },

        /** ** Vertical ** **/
        /** Sizes */
        verticalPage() {
            return Math.floor((state.posT % 1) * (state.canvasSize.height / state.zoom) * 6)
        },
        verticalMove() {
            return Math.floor(info.verticalPage() / 12)
        },

        /** Positions */
        top() {
            return 0
        },

        /** Boolean indicators */
        atTop() {
            return state.posT === info.top()
        },
        passingTop() {
            return state.posT <= info.top()
        },
    }

    return info
}
