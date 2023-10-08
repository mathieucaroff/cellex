import { BorderGroup, SideBorder, StochasticState, TopBorder } from "../patternlang/BorderType"
import { mod } from "../util/mod"
import { PerfectRandom } from "./misc/RandomMapper"

/** getStochastic finds the stochastic associated with a position of a group */
export let getStochastic = (group: BorderGroup, position: number): StochasticState => {
  // group.width is expected to always be a multiple of group.quantity
  position = position % (group.width / group.quantity)
  let border = group.content.find((border) => {
    position -= border.width
    if (position < 0) {
      position += border.width
      return true
    }
    return false
  })!
  if (border.type === "state") {
    return border
  } else {
    return getStochastic(border, position)
  }
}

/** getTopBorderValue reads the possibly random value of the given position of the top border */
export let getTopBorderValue = (border: TopBorder, x: number, random: PerfectRandom) => {
  let left = -Math.floor(border.center.width / 2)
  let right = left + border.center.width
  if (left <= x && x < right) {
    var stochastic = getStochastic(border.center, mod(x - left, border.center.width))
  } else if (x < left) {
    stochastic = getStochastic(border.cycleLeft, mod(x - left, border.cycleLeft.width))
  } else {
    // (x >= right)
    stochastic = getStochastic(border.cycleRight, mod(x - left, border.cycleRight.width))
  }
  return runStochastic(stochastic, random(x, stochastic.total))
}

/** getSideBorderValue reads the possibly random value of the given time of a side border */
export let getSideBorderValue = (border: SideBorder, t: number, random: PerfectRandom) => {
  if (t < border.init.width) {
    var stochastic = getStochastic(border.init, t)
  } else {
    stochastic = getStochastic(border.cycle, (t - border.init.width) % border.cycle.width)
  }
  return runStochastic(stochastic, random(t, stochastic.total))
}

/** runStochastic determines the value of a random border by going through its cumulative map.
    The parameter `value` is expected to be a random value between 0 and the last cumulative map value. */
export let runStochastic = (border: StochasticState, value: number) => {
  let result = 0
  border.cumulativeMap.some((v, k) => {
    result = k
    return v > value
  })
  return result
}
