import { FlatPattern, MonoPatternSet, Pattern, PatternGroup } from "./PatternType"

let repeat = <T>(arr: T[], count): T[] => {
  return Array.from({ length: count }, () => arr).flat()
}

export let flattenPattern = (original: Pattern): FlatPattern => {
  let flatten = (group: PatternGroup): MonoPatternSet[] => {
    let base = group.content.flatMap((element) => {
      if (element.type === "group") {
        return flatten(element)
      }
      return repeat(
        [{ visibility: group.visibility, stateSet: element.stateSet }],
        element.quantity,
      )
    })
    return repeat(base, group.quantity)
  }

  return {
    original,
    width: original.pattern.width,
    flat: flatten(original.pattern),
  }
}
