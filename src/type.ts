import { TopologyFiniteBorder } from "./topologyType"

export interface Pair {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect extends Pair, Size {}

export interface Color {
  red: number
  green: number
  blue: number
}

export interface Rule {
  dimension: number
  neighborhoodSize: number
  stateCount: number
  transitionFunction: number[]
}

export interface DiffModeOff {
  status: "off"
}
// s is a single number while the mouse is hovering. It becomes an array
// when the user clicks, locking the selection.
export interface DiffModeWaiting {
  status: "waiting"
}
export interface DiffModeHovering {
  status: "hovering"
  t: number
  s: number
  diffState: number
}
export interface DiffModeSelection {
  status: "selection"
  t: number
  s: number[]
  diffState: number
}
export type DiffMode = DiffModeOff | DiffModeWaiting | DiffModeHovering | DiffModeSelection

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
  colorMap: Color[]
  presentationMode: "present" | "off"
  diffMode: DiffMode
  topology: Omit<TopologyFiniteBorder, "kind"> & { kind: "border" | "loop" }
  seed: string

  canvasSize: {
    width: number
    height: number
  }
}

export interface StatePosition {
  posS: number
  posT: number
  redraw: boolean
}

export interface Remover {
  remove: () => void
}

export type DesktopOrMobile = "desktop" | "mobile"
