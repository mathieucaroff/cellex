export type ChangeSet = { t: number; changes: { s: number; amount: number }[] }[]

export interface DivineModeOff {
  status: "off"
  active: false
  propagation: boolean
}

/** DivineModeWaiting - the propagation mode is enabled, but the mouse isn't hovering
 * the canvas and there is no cell selection either */
export interface DivineModeWaiting {
  status: "waiting"
  active: false
  propagation: boolean
}

/** DivineModeHovering - the mouse is over the canvas and the changes are visible
 * as the cursor moves since no cell is selected */
export interface DivineModeHovering {
  status: "hovering"
  active: true
  propagation: boolean
  changes: [{ t: number; changes: [{ s: number; amount: 1 }] }]
}

/** DivineModeSelection - cells have been selected and the changes apply only to
 * these */
export interface DivineModeSelection {
  status: "selection"
  active: true
  /** propagation: if true, highlight the modified cell and all the children
   * that are affected by the change. if false, highlight only the modified
   * cell and show only the changed timeline */
  propagation: boolean
  /** changes: the time and spatial position of all the interventions
   * arranged pragmatically by time and position. */
  changes: ChangeSet
}

export type DivineMode =
  | DivineModeOff
  | DivineModeWaiting
  | DivineModeHovering
  | DivineModeSelection
