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
