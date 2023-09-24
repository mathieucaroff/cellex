import { describe, expect, it } from "vitest"

import { getTopBorderValue } from "../Engine"
import { createRandomMapper } from "../RandomMapper"
import {
  expectedGenesisLine14,
  expectedOutputLiney14,
  rule110Topology14,
} from "../engine.test-provisionning"
import { createTableRuleConceiver } from "./tableRule"

describe("The tableRule calculator", () => {
  it("Correctly computes one generation of rule 110 in looping topology", () => {
    let topology = rule110Topology14
    let randomMapper = createRandomMapper({ seedString: "_" })
    let calculator = createTableRuleConceiver(
      {
        kind: "tableRule",
        dimension: 1,
        neighborhoodSize: 3,
        stateCount: 2,
        reversible: false,
        transitionTable: [0, 1, 1, 0, 1, 1, 1, 0],
      },
      topology,
      randomMapper,
    )

    let left = -Math.floor(topology.width / 2)
    let genesis = Uint8Array.from({ length: topology.width }, (_, k) => {
      return getTopBorderValue(topology.genesis, k + left, randomMapper.top)
    })

    let currentT = 0
    let inputLine = new Uint8Array(genesis) // current
    let oldInputLine = Uint8Array.from({ length: genesis.length }) // previous
    let outputLine = Uint8Array.from({ length: genesis.length }) // previous
    expect(inputLine).toEqual(expectedGenesisLine14)

    calculator.conceive(inputLine, oldInputLine, outputLine, currentT)
    expect(outputLine).toEqual(expectedOutputLiney14)
  })
})
