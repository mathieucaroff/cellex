/**
 * SideBorder, what values to use for the infinite left or right wall of the simulation
 */
export interface SideBorder {
  init: BorderRootGroup
  cycle: BorderRootGroup
}

/**
 * TopBorder, what values to use for the initialization of the simulation
 */
export interface TopBorder {
  center: BorderRootGroup
  cycleLeft: BorderRootGroup
  cycleRight: BorderRootGroup
}

export interface BorderGroup {
  quantity: number
  width: number
  type: "group"
  content: BorderElement[]
}

export interface BorderRootGroup {
  quantity: 1
  width: number
  type: "group"
  content: BorderElement[]
}

export interface StochasticState {
  quantity: number
  width: number
  type: "state"
  cumulativeMap: number[]
  total: number
}

export type BorderElement = StochasticState | BorderGroup
