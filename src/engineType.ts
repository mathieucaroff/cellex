import { ChangeSet, DiffMode } from "./diffType"

/** A stepper computes a single generation of cells by going simultaneously
    through the three buffers it has as input */
export interface Stepper {
  step: (input: Uint8Array, olderInput: Uint8Array, output: Uint8Array, currentT: number) => void
  getStateCount: () => number
}

/** A roller computes and returns a buffer corresponding to any generation of
 * its cellular automaton and genesis */
export interface BasicRoller {
  getLine: (t: number) => Uint8Array
}

/** A roller computes and returns a buffer corresponding to any generation of
 * its cellular automaton and genesis */
export interface ControllableRoller extends BasicRoller {
  setChangeSet: (changeSet: ChangeSet) => void
}

/** The diffRoller manages diffing between two BasicRollers */
export interface DiffRoller extends BasicRoller {
  // getFirstRoller: () => BasicRoller
}

/** The engine handles diffMode changes with as little recomputations as
 * possible */
export interface Engine {
  setDiffMode: (diffMode: DiffMode) => void
  getLine: (t: number) => Uint8Array
}
