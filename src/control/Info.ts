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
    isBigEnough(): boolean
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
            return 0
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
            return state.canvasSize.width
        },
        horizontalMove() {
            return Math.floor(info.horizontalPage() / 12)
        },

        /** Positions */
        maxLeft() {
            return Math.floor((state.canvasSize.width - state.topology.width) / 2)
        },
        maxRight() {
            return Math.ceil((state.topology.width - state.canvasSize.width) / 2)
        },
        center() {
            return 0
        },
        isBigEnough() {
            return state.canvasSize.width < state.topology.width
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
            return state.canvasSize.height
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
