import { TopBorder } from "../patternlang/BorderType"
import { TopologyFinite } from "../topologyType"

export const ts = { type: "state" as const }
export const qw1 = { quantity: 1, width: 1 }
export const r1 = (x) => 0 // "random 1"
export const r2 = (x) => ((x % 2) + 2) % 2 // "random 2"
export const r10 = (x) => ((x % 10) + 10) % 10 // "random 10"
export let cMap = (cumulativeMap: number[]) => {
  return { cumulativeMap, total: cumulativeMap.slice(-1)[0] }
}

export let zero = { ...ts, ...qw1, ...cMap([1]) }
export let one = { ...ts, ...qw1, ...cMap([0, 1]) }
export let random01 = { ...ts, ...qw1, ...cMap([1, 2]) }

export let two = { ...ts, ...qw1, ...cMap([0, 0, 1]) }

// rule 110 topology with field width 10
let content = [..."11111000100110"].map((c) => (c === "1" ? one : zero))
let width = content.length
export let genesis: TopBorder = {
  center: { content: [], quantity: 1, type: "group", width: 0 },
  cycleLeft: { content, quantity: 1, type: "group", width },
  cycleRight: { content, quantity: 1, type: "group", width },
}

export let rule110Topology10: TopologyFinite = {
  kind: "loop",
  finitness: "finite",
  width: 10,
  genesis,
}

export let rule110Topology14: TopologyFinite = {
  ...rule110Topology10,
  width: 14,
}

export let impulse9Topology: TopologyFinite = {
  kind: "loop",
  finitness: "finite",
  width: 20,
  genesis: {
    center: { content: [], quantity: 1, type: "group", width: 0 },
    cycleLeft: { content, quantity: 1, type: "group", width },
    cycleRight: { content, quantity: 1, type: "group", width },
  },
}

export let expectedGenesisLine14 = new Uint8Array("01001101111100".split("").map((c) => Number(c)))
export let expectedOutputLiney14 = new Uint8Array("11011111000100".split("").map((c) => Number(c)))
