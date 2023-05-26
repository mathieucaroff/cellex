import { DiffMode } from "./diffType"
import { Rule } from "./ruleType"
import { TopologyFiniteBorder } from "./topologyType"
import { Color } from "./type"

export interface StatePosition {
  posS: number
  posT: number
  redraw: boolean
}

export type DarkMode = "dark" | "light"

/**
 * @param postS Spatial position
 * @param postT Temporal position
 */
export interface State extends StatePosition {
  rule: Rule

  speed: number
  play: boolean
  zoom: number
  darkMode: DarkMode
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
