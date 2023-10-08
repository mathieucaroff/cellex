import { DiffMode } from "../../diffType"
import { Stepper } from "../../engineType"
import { TopologyFinite } from "../../topologyType"
import { clone } from "../../util/clone"
import { getTopBorderValue } from "../borderGetter"
import { earliestDifference } from "../diffmode/earliestDifference"
import { RandomMapper } from "../misc/RandomMapper"

const SNAPSHOT_PERIOD = 400

/** createAutomatonEngine creates a 1d automaton computing machine for the given
    automaton, topology, and source of randomness */
export let createAutomatonRoller = (
  stepper: Stepper,
  topology: TopologyFinite,
  randomMapper: RandomMapper,
) => {
  let left = -Math.floor(topology.width / 2)
  let genesis = Uint8Array.from({ length: topology.width }, (_, k) => {
    return getTopBorderValue(topology.genesis, k + left, randomMapper.top)
  })

  let currentT = 0
  let lineA = new Uint8Array(genesis) // current
  let lineB = Uint8Array.from({ length: genesis.length }) // previous
  let lineC = Uint8Array.from({ length: genesis.length }) // one-before-previous
  let snapshotArray: [Uint8Array, Uint8Array][] = [[lineA, lineB]]

  let diffMode: DiffMode = {
    status: "off",
    active: false,
  }

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

  let me = {
    setDiffMode: (newDiffMode: DiffMode) => {
      if (!newDiffMode.active) {
        // becoming inactive or staying inactive
        // nothing to do
      } else if (diffMode.active) {
        // staying active
        reset(earliestDifference(diffMode.changes, newDiffMode.changes))
      } else {
        // becoming active
        reset(newDiffMode.changes[0].t)
      }

      diffMode = clone(newDiffMode)
    },
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
        // also save lineD if the diffMode status wants it
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

  return me
}

export type Engine = ReturnType<typeof createAutomatonRoller>
