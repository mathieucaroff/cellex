export interface SideBorder {
    init: BorderRootGroup
    cycle: BorderRootGroup
}

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
