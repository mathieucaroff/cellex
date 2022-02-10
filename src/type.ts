import { TopologyFinite } from "./topologyType"

export interface Pair {
    x: number
    y: number
}

export interface Size {
    width: number
    height: number
}

export interface Rect extends Pair, Size {}

export interface Rule {
    stateCount: number
    neighborhoodSize: number
    transitionFunction: number[]
}

/**
 * @param postS Spatial position
 * @param postT Temporal position
 */
export interface State {
    rule: Rule

    speed: number
    posS: number
    posT: number
    redraw: boolean
    play: boolean
    zoom: number
    // selectedSimpleGenesis: SimpleGenesis
    topology: TopologyFinite
    seed: string

    canvasSize: Size
}

export interface StatePosition {
    posS: number
    posT: number
    redraw: boolean
}

export interface Remover {
    remove: () => void
}
