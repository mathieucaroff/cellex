import { FlatPattern, Pattern, PatternElement, StateSet } from "./PatternType"

/**
 * The file is probably unused
 */

let repeat = <T>(arr: T[], count): T[] => {
  return ([] as T[]).concat(...Array(count).fill(arr))
}

export let flattenPattern = (original: Pattern): FlatPattern => {
  let flatten = (element: PatternElement): StateSet[] => {
    let base: StateSet[] = []
    if (element.type === "set") {
      base.push(element.stateSet)
    } else {
      base = base.concat(...element.content.map(flatten))
    }
    return repeat(base, element.quantity)
  }

  return {
    original,
    width: original.pattern.width,
    flat: flatten(original.pattern),
  }
}
