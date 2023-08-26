import { TableCodeAutomaton, TableRuleAutomaton } from "./automatonType"
import { DiffMode } from "./diffType"
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
  diffMode: DiffMode
  topology: Omit<TopologyFiniteBorder, "kind"> & { kind: "border" | "loop" }
  seed: string

  canvasSize: {
    width: number
    height: number
  }

  galleryIsOpen: boolean
}
