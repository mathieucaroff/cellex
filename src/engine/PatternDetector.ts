import { FlatPattern, Pattern, PatternColor, PatternWithColor } from "../patternlang/PatternType"
import { flattenPattern } from "../patternlang/flattenPattern"
import { TopologyFinite } from "../topologyType"

type OverlayLine = (PatternColor | undefined)[]

type PreparedPattern = {
  flat: FlatPattern
  color: PatternColor
  persistence: "none" | "persistent"
  masks: Map<number, boolean[]>
}

const DEFAULT_PATTERN: Pattern = {
  pattern: {
    type: "group",
    content: [{ type: "set", quantity: 1, width: 1, visibility: "visible", stateSet: [-1] }],
    quantity: 1,
    width: 1,
    visibility: "visible",
    capture: "visible",
  },
  type: "exact",
  repetition: "none",
  persistence: "none",
}

export function createPatternDetector(
  patternList: PatternWithColor[],
  topology: TopologyFinite,
  neighborhoodSize: number,
  getLine: (t: number) => Uint8Array,
) {
  let patterns: PreparedPattern[] = patternList
    .map(({ pattern = DEFAULT_PATTERN, color }) => ({
      flat: flattenPattern(pattern),
      color,
      persistence: pattern.persistence,
      masks: new Map(),
    }))
    .filter(
      ({ flat }) =>
        flat.flat.length > 0 && flat.flat.some(({ visibility }) => visibility === "visible"),
    )

  let getPatternMask = (pattern: PreparedPattern, t: number, line: Uint8Array): boolean[] => {
    let cached = pattern.masks.get(t)
    if (cached) {
      return cached
    }

    let mask = Array.from({ length: line.length }, () => false)
    let { flat } = pattern
    let candidateFlats = [flat.flat]
    if (flat.original.repetition === "cycle") {
      candidateFlats = flat.flat.map((_, offset) =>
        flat.flat.slice(offset).concat(flat.flat.slice(0, offset)),
      )
    }

    candidateFlats.forEach((candidate) => {
      for (let start = 0; start < line.length; start += 1) {
        if (topology.kind === "border" && start + candidate.length > line.length) {
          continue
        }
        if (
          candidate.every(({ stateSet }, offset) => {
            let x = topology.kind === "loop" ? (start + offset) % line.length : start + offset
            return stateSet.includes(line[x])
          })
        ) {
          candidate.forEach(({ visibility }, offset) => {
            if (visibility === "visible") {
              let x = topology.kind === "loop" ? (start + offset) % line.length : start + offset
              mask[x] = true
            }
          })
        }
      }
    })

    if (pattern.persistence === "persistent" && t > 0) {
      let previousLine = getLine(t - 1)
      let previousMask = getPatternMask(pattern, t - 1, previousLine)
      let radius = Math.floor(neighborhoodSize / 2)
      for (let x = 0; x < line.length; x += 1) {
        let sourceIsInBounds = (offset: number) =>
          topology.kind === "loop" || (0 <= x + offset && x + offset < line.length)
        let isCovered = Array.from(
          { length: neighborhoodSize },
          (_, index) => index - radius,
        ).every(
          (offset) =>
            sourceIsInBounds(offset) && previousMask[(x + offset + line.length) % line.length],
        )
        if (isCovered) {
          mask[x] = true
        }
      }
    }

    pattern.masks.set(t, mask)
    return mask
  }

  return {
    reset() {
      patterns.forEach((pattern) => pattern.masks.clear())
    },
    getOverlayLine(t: number): OverlayLine {
      let line = getLine(t)
      let overlay: OverlayLine = Array.from({ length: line.length })
      patterns.forEach((pattern) => {
        getPatternMask(pattern, t, line).forEach((matched, x) => {
          if (matched) {
            overlay[x] = pattern.color
          }
        })
      })
      return overlay
    },
  }
}
