import { State } from "../stateType"

export let createInfo = (state: State) => {
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
      return state.canvasSize.width / state.zoom
    },
    horizontalMove() {
      return Math.floor(info.horizontalPage() / 12)
    },

    /** Positions */
    maxLeft() {
      return Math.ceil((state.topology.width / state.zoom - state.canvasSize.width) / 2)
    },
    maxRight() {
      return Math.floor((state.canvasSize.width - state.topology.width / state.zoom) / 2)
    },
    center() {
      return 0
    },
    zoomedSimulationIsBiggerThanCanvas() {
      return state.topology.width * state.zoom > state.canvasSize.width
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
      return state.canvasSize.height / state.zoom
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

export type Info = ReturnType<typeof createInfo>
