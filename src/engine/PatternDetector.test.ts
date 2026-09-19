import { describe, expect, it } from "vitest"

import { parsePatternList } from "../patternlang/parser"
import { TopologyFinite } from "../topologyType"
import { createPatternDetector } from "./PatternDetector"

let borderTopology = (width: number): TopologyFinite => ({
  finitness: "finite",
  kind: "border",
  width,
  genesis: {} as any,
  borderLeft: {} as any,
  borderRight: {} as any,
})

let loopTopology = (width: number): TopologyFinite => ({
  finitness: "finite",
  kind: "loop",
  width,
  genesis: {} as any,
})

let detector = (input: string, topology: TopologyFinite, lines: number[][], neighborhoodSize = 3) =>
  createPatternDetector(parsePatternList(input), topology, neighborhoodSize, (t) =>
    Uint8Array.from(lines[t]),
  )

describe("pattern detector", () => {
  it("uses hidden positions as constraints without coloring them", () => {
    let subject = detector("!1(:?0)1:red", borderTopology(3), [[1, 0, 1]])

    expect(subject.getOverlayLine(0)).toEqual(["red", undefined, "red"])
  })

  it("tests cyclic patterns at each rotation", () => {
    let subject = detector("=01:blue", borderTopology(2), [[1, 0]])

    expect(subject.getOverlayLine(0)).toEqual(["blue", "blue"])
  })

  it("matches through a loop boundary but not a finite border", () => {
    let lines = [[1, 0]]
    let pattern = "!01:green"

    expect(detector(pattern, borderTopology(2), lines).getOverlayLine(0)).toEqual([
      undefined,
      undefined,
    ])
    expect(detector(pattern, loopTopology(2), lines).getOverlayLine(0)).toEqual(["green", "green"])
  })

  it("propagates a persistent pattern from a complete neighborhood-width run", () => {
    let subject = detector("^111:cyan", borderTopology(3), [
      [1, 1, 1],
      [0, 0, 0],
      [0, 0, 0],
    ])

    expect(subject.getOverlayLine(0)).toEqual(["cyan", "cyan", "cyan"])
    expect(subject.getOverlayLine(1)).toEqual([undefined, "cyan", undefined])
    expect(subject.getOverlayLine(2)).toEqual([undefined, undefined, undefined])
  })

  it("uses the last matching pattern's color", () => {
    let subject = detector("!1:red,!1:yellow", borderTopology(1), [[1]])

    expect(subject.getOverlayLine(0)).toEqual(["yellow"])
  })
})
