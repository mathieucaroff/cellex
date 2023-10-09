import { BasicRoller, Stepper } from "../../engineType"
import { TopologyFinite } from "../../topologyType"
import { getTopBorderValue } from "../borderGetter"
import { SNAPSHOT_PERIOD } from "../engine.constants"
import { RandomMapper } from "../misc/RandomMapper"

/** createAutomatonEngine creates a 1d automaton computing machine for the given
    automaton, topology, and source of randomness */
export let createBasicRoller = (
  stepper: Stepper,
  topology: TopologyFinite,
  randomMapper: RandomMapper,
): BasicRoller => {
  let left = -Math.floor(topology.width / 2)
  let genesis = Uint8Array.from({ length: topology.width }, (_, k) => {
    return getTopBorderValue(topology.genesis, k + left, randomMapper.top)
  })

  let currentT = 0
  let lineA = new Uint8Array(genesis) // current
  let lineB = Uint8Array.from({ length: genesis.length }) // previous
  let lineC = Uint8Array.from({ length: genesis.length }) // one-before-previous
  let snapshotArray: [Uint8Array, Uint8Array][] = [[lineA, lineB]]

  // reset sets the engine current time and current line to the closest
  // snapshot available taken before the target time.
  let reset = (targetTime: number) => {
    if (currentT < targetTime) {
      // we cannot reset the time to a future time, only a past time
      // (we keep only the oldest of the two times)
      return
    }
    let arrayIndex = Math.floor(targetTime / SNAPSHOT_PERIOD)
    currentT = SNAPSHOT_PERIOD * arrayIndex
    ;[lineA, lineB] = snapshotArray[arrayIndex]
  }

  reset(0)

  return {
    getLine: (t: number): Uint8Array => {
      if (t < currentT) {
        if (t < 0) {
          return Uint8Array.from({ length: topology.width })
        } else if (t >= 0) {
          reset(t)
        }
      }
      while (currentT < t) {
        // save lineA if currentT is a multiple of SNAPSHOT_PERIOD
        // also save lineD if the divineMode status wants it
        if (currentT % SNAPSHOT_PERIOD === 0) {
          let arrayIndex = Math.floor(currentT / SNAPSHOT_PERIOD)
          snapshotArray[arrayIndex] = [new Uint8Array(lineA), new Uint8Array(lineB)]
        }

        // [here lineA is the current line]
        // the input is line A and line C is the output
        stepper.step(lineA, lineB, lineC, currentT)
        // increase time
        currentT += 1
        // rotate the three lines by name
        ;[lineB, lineC, lineA] = [lineA, lineB, lineC]
        // [now lineA is the current line again]
      }

      return lineA
    },
  }
}
