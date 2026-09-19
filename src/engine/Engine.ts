import { TableAutomaton } from "../automatonType"
import { DivineMode } from "../divineType"
import { BasicRoller, ControllableRoller, Engine } from "../engineType"
import { PatternWithColor } from "../patternlang/PatternType"
import { TopologyFinite } from "../topologyType"
import { clone } from "../util/clone"
import { createPatternDetector } from "./PatternDetector"
import { createRandomMapper } from "./misc/RandomMapper"
import { createBasicRoller } from "./roller/BasicRoller"
import { createControllableRoller } from "./roller/ControllableRoller"
import { createDiffRoller } from "./roller/DiffRoller"
import { createStepper } from "./stepper/Stepper"

export interface EngineProp {
  automaton: TableAutomaton
  topology: TopologyFinite
  seed: string
  interventionColorIndex: number
  patternList?: PatternWithColor[]
}

export function createAutomatonEngine(prop: EngineProp): Engine {
  let { automaton, topology, seed, interventionColorIndex, patternList = [] } = prop

  let randomMapper = createRandomMapper({ seedString: seed })
  let stepper = createStepper(automaton, topology, randomMapper)

  let basicRoller: BasicRoller = createBasicRoller(stepper, topology, randomMapper)
  let controllableRoller: ControllableRoller
  let roller = basicRoller

  let divineMode: DivineMode = {
    active: false,
    status: "off",
    propagation: true,
  }

  let patternDetector = createPatternDetector(
    patternList,
    topology,
    automaton.neighborhoodSize,
    (t) => roller.getLine(t),
  )

  return {
    setDivineMode(newDivineMode: DivineMode) {
      if (divineMode.active) {
        if (!newDivineMode.active) {
          // becoming inactive -> switch to basic roller
          roller = basicRoller
        } else {
          // staying active -> update changeSet
          controllableRoller.setChangeSet(newDivineMode.changes)
          if (!divineMode.propagation && newDivineMode.propagation) {
            // adding propagation mode -> switch to diff roller
            roller = createDiffRoller(basicRoller, controllableRoller, interventionColorIndex)
          } else if (divineMode.propagation && !newDivineMode.propagation) {
            // removing propagation mode -> switch to controllable roller
            roller = controllableRoller
          }
        }
      } else {
        if (!newDivineMode.active) {
          // staying inactive -> nothing to do
        } else {
          // becoming active -> switch to a controllable roller or a diff roller
          // depending on the propagation setting
          controllableRoller = createControllableRoller(
            stepper,
            topology,
            randomMapper,
            interventionColorIndex,
          )
          controllableRoller.setChangeSet(newDivineMode.changes)
          if (newDivineMode.propagation) {
            roller = createDiffRoller(basicRoller, controllableRoller, interventionColorIndex)
          } else {
            roller = controllableRoller
          }
        }
      }

      divineMode = clone(newDivineMode)
      patternDetector.reset()
    },
    getLine(t) {
      return roller.getLine(t)
    },
    getPatternOverlayLine(t) {
      return patternDetector.getOverlayLine(t)
    },
    getLineLength() {
      return topology.width
    },
  }
}
