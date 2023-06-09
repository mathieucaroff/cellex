export interface DiffModeOff {
  status: "off"
  active: false
}

/** DiffModeWaiting - the diff mode is enabled, but the mouse isn't hovering
 * the canvas and there is no cell selection either */
export interface DiffModeWaiting {
  status: "waiting"
  active: false
  divine: boolean
}

/** DiffModeHovering - the mouse is over the canvas and the changes are visible
 * as the cursor moves since no cell is selected */
export interface DiffModeHovering {
  status: "hovering"
  active: true
  divine: boolean
  changes: [{ t: number; changes: [{ s: number; amount: 1 }] }]
}
/** DiffModeSelection - cells have been selected and the changes apply only to
 * these */
export interface DiffModeSelection {
  status: "selection"
  active: true
  /** divine: if true, highlight only the modified cell and show only the
   * changed timeline. if false, hightlight the modified cell and all the
   * children that are affected by the change */
  divine: boolean
  /** changes: the time and spatial position of all the interventions
   * arranged pragmatically by time and position */
  changes: { t: number; changes: { s: number; amount: number }[] }[]
}
export type DiffMode = DiffModeOff | DiffModeWaiting | DiffModeHovering | DiffModeSelection
