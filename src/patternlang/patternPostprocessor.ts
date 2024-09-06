import {
  Pattern,
  PatternElement,
  PatternGroup,
  PatternRootGroup,
  PatternSet,
} from "./PatternType"
import { totalWidth } from "./borderPostprocessor"

export let zero = () => 0
export let one = () => 1

// ## Pattern
export let pattern = ([iFlag, iGroup]: [
  Pattern,
  PatternRootGroup,
]): Pattern => {
  return { ...iFlag, pattern: iGroup }
}

// ## Flag
export let flag = ([input]: [string]): Pattern => {
  let pattern = {} as PatternRootGroup
  // Note: `.pattern` is overwritten inside `pattern()`

  if (input === "!") {
    return {
      type: "exact",
      repetition: "none",
      persistence: "none",
      pattern,
    }
  } else if (input === "^") {
    return {
      type: "triangle",
      repetition: "none",
      persistence: "persistent",
      pattern,
    }
  } else if (input === "=") {
    return {
      type: "cyclic",
      repetition: "cycle",
      persistence: "none",
      pattern,
    }
  } else if (input === "#") {
    return {
      type: "grid",
      repetition: "cycle",
      persistence: "persistent",
      pattern,
    }
  } else {
    throw new Error(`bad flag '${flag}'`)
  }
}

type Visibility = PatternGroup["visibility"]

type FGroup = (v: Visibility) => (pe: [[], PatternElement[]]) => PatternGroup

// ## Group
export let group: FGroup = (capture) => (arg) => {
  let [_, elementList] = arg
  if (capture === "hidden")
    elementList.forEach((elem) => {
      if (elem.type === "set") {
        elem.visibility = capture
      }
    })

  let isVisible =
    capture === "visible" ||
    elementList.some((e) => e.type === "group" && e.capture === "visible")
  let visibility: typeof capture = isVisible ? "visible" : "hidden"

  return {
    type: "group",
    content: elementList,
    quantity: 1,
    width: totalWidth(elementList),
    visibility,
    capture,
  }
}

// ## StateSet
export let patternSet = ([stateList]: [number[]]): PatternSet => {
  let uniq = (x: unknown, k: number, arr: unknown[]) =>
    !arr.slice(0, k).includes(x)

  return {
    type: "set",
    stateSet: stateList.sort().filter(uniq),
    quantity: 1,
    width: 1,
    visibility: "visible",
  }
}
