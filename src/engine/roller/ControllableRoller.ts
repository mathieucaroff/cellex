import { ChangeSet } from "../../divineType"
import { ControllableRoller, Stepper } from "../../engineType"
import { TopologyFinite } from "../../topologyType"
import { getTopBorderValue } from "../borderGetter"
import { earliestDifference } from "../diffmode/earliestDifference"
import { SNAPSHOT_PERIOD } from "../engine.constants"
import { RandomMapper } from "../misc/RandomMapper"

/** createAutomatonEngine creates a 1d automaton computing machine for the given
    automaton, topology, and source of randomness */
export let createControllableRoller = (
  stepper: Stepper,
  topology: TopologyFinite,
  randomMapper: RandomMapper,
  tOffset = 0,
): ControllableRoller => {
  let left = -Math.floor(topology.width / 2)
  let genesis = Uint8Array.from({ length: topology.width }, (_, k) => {
    return getTopBorderValue(topology.genesis, k + left, randomMapper.top)
  })

  let currentT = 0
  let lineA = new Uint8Array(genesis) // current
  let lineB = Uint8Array.from({ length: genesis.length }) // previous
  let lineC = Uint8Array.from({ length: genesis.length }) // one-before-previous
  let snapshotArray: [Uint8Array, Uint8Array][] = [[lineA, lineB]]

  let changeSet: ChangeSet = []
  let changeIndex = 0

  // updateChangeIndex updates the changeIndex so that the current time matches change corresponding to the change index or that the corresponding change is the first after the current time. Beware, if the current time is after the last change, then the changeIndex will be set to the change set length, thus pointing outside of the set.
  let updateChangeIndex = () => {
    // Handle the case where a change has been removed from the set.
    if (changeSet.length <= changeIndex) {
      changeIndex = changeSet.length
    }
    // Reduce changeIndex until the change at changeIndex is before the current time, or equal to it.
    while (changeIndex > 0 && changeSet[changeIndex - 1].t > currentT) {
      changeIndex--
    }
    // Increase changeIndex as long as the change at changeIndex is before the current time, or equal to it.
    while (changeIndex < changeSet.length && changeSet[changeIndex].t < currentT) {
      changeIndex++
    }
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
    updateChangeIndex()
  }

  reset(0)

  return {
    setChangeSet: (newChangeSet: ChangeSet) => {
      reset(earliestDifference(changeSet, newChangeSet))
      changeSet = newChangeSet
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
        if (currentT % SNAPSHOT_PERIOD === 0) {
          let arrayIndex = Math.floor(currentT / SNAPSHOT_PERIOD)
          snapshotArray[arrayIndex] = [new Uint8Array(lineA), new Uint8Array(lineB)]
        }

        // [here lineA is the current line]
        // the input is line A and line C is the output
        stepper.step(lineA, lineB, lineC, currentT - tOffset)
        // increase time
        currentT += 1
        // rotate the three lines by name
        ;[lineB, lineC, lineA] = [lineA, lineB, lineC]
        // [now lineA is the current line again]

        // /\ CODE FOR CONTROLLABILITY HANDLING
        // if the changeIndex exceeds the changeSet length then there's
        // nothing to do
        if (changeIndex < changeSet.length) {
          // if the current time matches the changeSet time, apply the
          // changes
          if (changeSet[changeIndex].t === currentT) {
            let change = changeSet[changeIndex]
            for (let intervention of change.changes) {
              lineA[intervention.s] =
                (lineA[intervention.s] + intervention.amount) % stepper.getStateCount()
            }
            changeIndex += 1
          }
        }
        // \/ END OF CODE FOR CONTROLLABILITY HANDLING
      }

      return lineA
    },
  }
}
