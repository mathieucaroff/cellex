import { deepEqual } from "../util/deepEqual"
import { BorderElement, BorderGroup, SideBorder, StochasticState, TopBorder } from "./BorderType"

export let presentTopBorder = (border: TopBorder): string => {
  let a = presentGroup(border.cycleLeft)
  let b = presentGroup(border.center)
  let c = presentGroup(border.cycleRight)
  if (a === c) {
    return `${b}(${c})`
  }
  return `(${a})${b}(${c})`
}
export let presentSideBorder = (border: SideBorder): string => {
  return `${presentGroup(border.init)}(${presentGroup(border.cycle)})`
}

export let presentGroup = (group: BorderGroup): string => {
  let normalizedContent = getNormalizedContent(group)
  let content = normalizedContent.map((x) =>
    x.type === "group" ? presentGroup(x) : presentState(x),
  )

  return decorate(content.join(""), group, true)
}

export let presentState = (state: StochasticState): string => {
  let array = presentCumulativeMap(state.cumulativeMap)
  let result = array.join("")
  if (result.length > 1) {
    return decorate(`[${result}]`, state, false)
  } else {
    return decorate(result, state, false)
  }
}

export let presentCumulativeMap = (cumulativeMap: number[]): string[] => {
  let last = 0
  let array: string[] = []
  cumulativeMap.forEach((counter, index) => {
    if (counter > last) {
      let diff = counter - last
      if (diff > 3) {
        array.push(index.toString(36) + `{${diff}}`)
      } else {
        array.push(index.toString(36).repeat(diff))
      }
    }
    last = counter
  })
  return array
}

export let decorate = (
  representation: string,
  border: BorderGroup | StochasticState,
  isGroup: boolean,
): string => {
  if (border.quantity > 1) {
    if (isGroup) {
      return `(${representation}){${border.quantity}}`
    } else {
      return `${representation}{${border.quantity}}`
    }
  }
  return representation
}

export let getNormalizedContent = (group: BorderGroup): BorderElement[] => {
  let compactContent: BorderElement[] = []
  let lastElement: BorderElement | undefined
  group.content.forEach((element) => {
    if (
      element.type !== "state" ||
      lastElement?.type !== "state" ||
      !deepEqual(element.cumulativeMap, lastElement?.cumulativeMap)
    ) {
      lastElement = { ...element }
      compactContent.push(lastElement)
    } else {
      lastElement.quantity += element.quantity
      lastElement.width += element.width
    }
  })

  let normalizedContent: BorderElement[] = []
  compactContent.forEach((element) => {
    if (
      element.type === "state" &&
      2 <= element.quantity &&
      element.quantity <= 4 &&
      presentCumulativeMap(element.cumulativeMap).length === 1
    ) {
      let singleElement = { ...element, quantity: 1, width: 1 }
      normalizedContent.push(...Array.from({ length: element.quantity }, () => singleElement))
    } else {
      normalizedContent.push(element)
    }
  })
  return normalizedContent
}
