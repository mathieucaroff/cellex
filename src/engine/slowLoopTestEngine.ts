import { TableRule } from "../ruleType"
import { TopologyFinite } from "../topologyType"
import { mod } from "../util/mod"
import { getTopBorderValue } from "./Engine"
import { RandomMapper } from "./RandomMapper"

export let createSlowLoopEngine = (
  rule: TableRule,
  topology: TopologyFinite,
  randomMapper: RandomMapper,
) => {
  let halfNeighborhood = Math.floor(rule.neighborhoodSize / 2)
  let functionLength = rule.transitionTable.length

  let getFirstLine = (): Uint8Array => {
    let left = -Math.floor(topology.width / 2)
    return Uint8Array.from({ length: topology.width }, (_, kx) =>
      getTopBorderValue(topology.genesis, kx + left, randomMapper.top),
    )
  }

  let nextIndexLine = (line: Uint8Array): Uint16Array => {
    return Uint16Array.from({ length: topology.width }, (_, x) => {
      let total = 0
      for (let dx = -halfNeighborhood; dx <= halfNeighborhood; dx += 1) {
        total *= rule.stateCount
        let inc = line[mod(x + dx, line.length)]
        total += inc
      }
      return total
    })
  }

  let dereference = (indexLine: Uint16Array): Uint8Array =>
    Uint8Array.from(indexLine, (v) => rule.transitionTable[functionLength - 1 - v])

  return {
    getIndexLine: (t: number): Uint16Array => {
      let line = getFirstLine()
      Array.from({ length: t - 1 }, () => {
        line = dereference(nextIndexLine(line))
      })
      return nextIndexLine(line)
    },
    getLine: (t: number): Uint8Array => {
      let line = getFirstLine()
      Array.from({ length: t }, () => {
        line = dereference(nextIndexLine(line))
      })
      return line
    },
  }
}
