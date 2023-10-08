import { DiffMode } from "../diffType"
import { BasicRoller, ControllableRoller, Engine } from "../engineType"
import { clone } from "../util/clone"
import { createRandomMapper } from "./misc/RandomMapper"
import { createBasicRoller } from "./roller/BasicRoller"
import { createControllableRoller } from "./roller/ControllableRoller"
import { createStepper } from "./stepper/Stepper"

export interface EngineProp {
  automaton: any
  topology: any
  seed: string
}

export function createAutomatonEngine(prop: EngineProp): Engine {
  let { automaton, topology, seed } = prop

  let randomMapper = createRandomMapper({ seedString: seed })
  let stepper = createStepper(automaton, topology, randomMapper)

  let basicRoller: BasicRoller = createBasicRoller(stepper, topology, randomMapper)
  let controllableRoller: ControllableRoller
  let roller = basicRoller

  let diffMode: DiffMode = {
    active: false,
    status: "off",
  }

  return {
    setDiffMode(newDiffMode: DiffMode) {
      if (diffMode.active) {
        if (!newDiffMode.active) {
          // becoming inactive -> switch to basic roller
          roller = basicRoller
        } else {
          // staying active -> update changeSet
          controllableRoller.setChangeSet(newDiffMode.changes)
        }
      } else {
        if (!newDiffMode.active) {
          // staying inactive -> nothing to do
        } else {
          // becoming active -> switch to controllable roller
          controllableRoller = createControllableRoller(stepper, topology, randomMapper)
          roller = controllableRoller
        }
      }

      diffMode = clone(newDiffMode)
    },
    getLine(t) {
      return roller.getLine(t)
    },
  }
}
