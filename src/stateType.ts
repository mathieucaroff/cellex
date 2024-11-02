import { TableAutomaton } from "./automatonType"
import { DivineMode } from "./divineType"
import { TopologyFiniteBorder } from "./topologyType"
import { Color } from "./type"

export interface StatePosition {
  posS: number
  posT: number
}

export type DarkMode = "dark" | "light"

export type ImmersiveMode = "immersive" | "off"

export type PresentationMode = "present" | "off"

/**
 * @param postS Spatial position
 * @param postT Temporal position
 */
export interface State extends StatePosition {
  automaton: TableAutomaton

  speed: number
  play: boolean
  zoom: number
  darkMode: DarkMode
  immersiveMode: ImmersiveMode
  presentationMode: PresentationMode
  colorMap: Color[]
  divineMode: DivineMode // todo: rename DivineMode into something which encompasses the divine case and the differential case
  displayMinimap: boolean
  topology: Omit<TopologyFiniteBorder, "kind"> & { kind: "border" | "loop" }
  infiniteHorizontalPanning: boolean
  seed: string

  canvasSize: {
    width: number
    height: number
  }

  galleryIsOpen: boolean
}
