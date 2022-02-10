import { TopBorderDescriptor, SideBorderDescriptor, BorderDescriptor } from "./borderType"

interface __TopologyBase {
    genesis: TopBorderDescriptor
}

interface __TopologyFiniteBase extends __TopologyBase {
    finitness: "finite"
    width: number
}

export interface TopologyFiniteBorder extends __TopologyFiniteBase {
    kind: "border"
    borderLeft: SideBorderDescriptor
    borderRight: SideBorderDescriptor
}

export interface TopologyFiniteLoop extends __TopologyFiniteBase {
    kind: "loop"
}

export type TopologyFinite = TopologyFiniteBorder | TopologyFiniteLoop

export interface TopologyInfinite extends __TopologyBase {
    finitness: "infinite"
}

export type Topology = TopologyFinite | TopologyInfinite
