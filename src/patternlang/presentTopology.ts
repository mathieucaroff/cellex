import { Topology } from "../topologyType"
import { SideBorder, TopBorder } from "./BorderType"
import { presentSideBorder, presentTopBorder } from "./presenter"

export interface CompactTopologyFiniteBorder {
  left: SideBorder
  width: number
  top: TopBorder
  right: SideBorder
}

export interface CompactTopologyFiniteLoop {
  top: TopBorder
  width: number
}

export type CompactTopologyFinite = CompactTopologyFiniteBorder | CompactTopologyFiniteLoop

export interface CompactTopologyInfinite {
  top: TopBorder
  width: "infinite"
}

export type CompactTopology = CompactTopologyFinite | CompactTopologyInfinite

export let presentTopology = (topology: Topology): string => {
  let top = presentTopBorder(topology.genesis)

  if (topology.finitness === "infinite") {
    return `width=infinite;top=${top}`
  }
  if (topology.kind === "loop") {
    return `width=${topology.width};top=${top}`
  }

  let left = presentSideBorder(topology.borderLeft)
  let right = presentSideBorder(topology.borderRight)

  return `width=${topology.width};left=${left};top=${top};right=${right}`
}
