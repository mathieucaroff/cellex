/** Parsed pattern selected by the `!` flag: finite and non-persistent. */
export interface ExactPattern {
  type: "exact"
  repetition: "none"
  persistence: "none"
  pattern: PatternRootGroup
}

/** Parsed pattern selected by the `^` flag: finite and persistent. */
export interface TrianglePattern {
  type: "triangle"
  repetition: "none"
  persistence: "persistent"
  pattern: PatternRootGroup
}

/** Parsed pattern selected by the `=` flag: cyclic and non-persistent. */
export interface CyclicPattern {
  type: "cyclic"
  repetition: "cycle"
  persistence: "none"
  pattern: PatternRootGroup
}

/** Parsed pattern selected by the `#` flag: cyclic and persistent. */
export interface GridPattern {
  type: "grid"
  repetition: "cycle"
  persistence: "persistent"
  pattern: PatternRootGroup
}

/** A parsed pattern mode together with its root content group. */
export type Pattern = ExactPattern | TrianglePattern | CyclicPattern | GridPattern

/** Pattern content expanded into one state-set choice per horizontal position. */
export interface FlatPattern {
  original: Pattern
  width: number
  flat: MonoPatternSet[]
}

export interface MonoPatternSet {
  visibility: PatternVisibility
  stateSet: StateSet
}

/** Allowed state values for one pattern position. Multiple values represent a set of options. */
export type StateSet = number[]

// ## Internal types

/** Whether an element contributes values to the flattened pattern. */
export type PatternVisibility = "visible" | "hidden"

/** A (possibly nested) sequence of pattern elements, optionally repeated. */
export interface PatternGroup {
  /** Number of consecutive repetitions of `content`. */
  quantity: number
  /** Total expanded width, including `quantity`. */
  width: number
  /** Computed visibility. Always equal to `capture`. */
  visibility: PatternVisibility
  type: "group"
  content: PatternElement[]
  /** Whether this group was written as a visible or hidden capture. */
  capture: PatternVisibility
}

/** The parser's outer group; it always occurs exactly once. */
export interface PatternRootGroup extends PatternGroup {
  quantity: 1
  visibility: "visible"
  capture: "visible"
}

/** One position that permits one or more automaton states, optionally repeated. */
export interface PatternSet {
  /** Number of consecutive repetitions of `stateSet`. */
  quantity: number
  /** Always equal to `quantity`. */
  width: number
  visibility: PatternVisibility
  type: "set"
  stateSet: StateSet
}

/** A group or a state choice; groups recursively contain more elements. */
export type PatternElement = PatternGroup | PatternSet
