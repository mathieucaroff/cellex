import { TableCodeAutomaton, TableRuleAutomaton } from "./automatonType"
import { DivineMode } from "./divineType"
import { TopologyFiniteBorder } from "./topologyType"
import { Color } from "./type"

export interface StatePosition {
  posS: number
  posT: number
}

export type DarkMode = "dark" | "light"

/**
 * @param postS Spatial position
 * @param postT Temporal position
 */
export interface State extends StatePosition {
  automaton: TableRuleAutomaton | TableCodeAutomaton

  speed: number
  play: boolean
  zoom: number
  darkMode: DarkMode
  immersiveMode: "immersive" | "off"
  presentationMode: "present" | "off"
  colorMap: Color[]
  divineMode: DivineMode // todo: rename DivineMode into something which encompasses the divine case and the differential case
  topology: Omit<TopologyFiniteBorder, "kind"> & { kind: "border" | "loop" }
  seed: string

  canvasSize: {
    width: number
    height: number
  }

  galleryIsOpen: boolean
}
