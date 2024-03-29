import { describe, expect, it } from "vitest"

import { getTopBorderValue } from "../borderGetter"
import { createRandomMapper } from "../misc/RandomMapper"
import { createSlowLoopEngine } from "../slowLoopTestEngine"
import { rule110Topology14 } from "../test-provisionning"
import { createTableCodeStepper } from "./tableCode"

describe("The tableCode calculator", () => {
  it("Correctly computes one generation of code 6, i.e. rule 126, in looping topology", () => {
    let topology8 = {
      ...rule110Topology14,
      width: 8,
    }
    let randomMapper = createRandomMapper({ seedString: "_" })
    let stepper = createTableCodeStepper(
      {
        kind: "tableCode",
        dimension: 1,
        neighborhoodSize: 3,
        stateCount: 2,
        transitionTable: [0, 1, 1, 0],
        reversible: false,
      },
      topology8,
      randomMapper,
    )

    // code 6 is equal to rule 126
    let slowEngine = createSlowLoopEngine(
      {
        kind: "tableRule",
        dimension: 1,
        neighborhoodSize: 3,
        stateCount: 2,
        transitionTable: [0, 1, 1, 1, 1, 1, 1, 0],
        reversible: false,
      },
      topology8,
      randomMapper,
    )

    let left = -Math.floor(topology8.width / 2)
    let genesis = Uint8Array.from({ length: topology8.width }, (_, k) => {
      return getTopBorderValue(topology8.genesis, k + left, randomMapper.top)
    })

    let currentT = 0
    let inputLine = new Uint8Array(genesis) // current
    let oldInputLine = new Uint8Array(genesis) // current
    let outputLine = Uint8Array.from({ length: genesis.length }) // previous
    expect(inputLine).toEqual(new Uint8Array("01101111".split("").map((c) => Number(c))))
    expect(inputLine).toEqual(slowEngine.getLine(0))

    stepper.step(inputLine, oldInputLine, outputLine, currentT)
    expect(outputLine).toEqual(slowEngine.getLine(1))
  })
})
