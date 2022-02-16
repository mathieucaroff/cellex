import { TopBorder, SideBorder } from "./patternlang/BorderType"

export interface TopologyFiniteBorder {
    genesis: TopBorder
    finitness: "finite"
    width: number
    kind: "border"
    borderLeft: SideBorder
    borderRight: SideBorder
}

export interface TopologyFiniteLoop {
    genesis: TopBorder
    finitness: "finite"
    width: number
    kind: "loop"
}

export type TopologyFinite = TopologyFiniteBorder | TopologyFiniteLoop

export interface TopologyInfinite {
    genesis: TopBorder
    finitness: "infinite"
}

export type Topology = TopologyFinite | TopologyInfinite
