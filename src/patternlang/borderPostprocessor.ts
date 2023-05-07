export let zero = () => 0
export let one = () => 1

export let cmZero = [1] // 100% odds of getting 0
export let cmOne = [0, 1] // 100% odds of getting 1

export let totalWidth = (list) => {
  return list.reduce((acc, elem) => acc + elem.width, 0)
}

export let emptyGroup = {
  type: "group",
  content: [],
  quantity: 1,
  width: 0,
}

export let asSimpleState = ([input]) => {
  let cumulativeMap = Array.from({ length: input + 1 }, (_, k) => (k === input ? 1 : 0))
  return makeState(cumulativeMap)
}

export let withQuantity = ([input]) => {
  return {
    value: input,
    quantity: 1,
  }
}

export let asNumber = ([input]) => {
  return +input
}

// stochasticState builds a cumulativeMap and makes a stochastic state from it
// the input it accepts is an array of what `withQuantity()` outputs
export let stochasticState = ([qStateList]: [{ value: number; quantity: number }[]]) => {
  // Determine the maximum value, to know the length of the list
  // N.B. the values each correspond to a state, a color.
  let maxValue = Math.max(...qStateList.map((x) => x.value))

  // Allocate the array
  let flatMap: number[] = Array.from({ length: maxValue + 1 }, () => 0)

  // sum the quantities of each value
  qStateList.forEach(({ value, quantity }) => {
    flatMap[value] += quantity
  })

  let cumulatedValue = 0
  let cumulativeMap: number[] = Array.from({ length: maxValue + 1 }, (_, k) => {
    cumulatedValue += flatMap[k]
    return cumulatedValue
  })

  let res = makeState(cumulativeMap)
  return res
}

export let makeState = (cumulativeMap) => ({
  type: "state",
  cumulativeMap,
  total: cumulativeMap.slice(-1)[0],
  quantity: 1,
  width: 1,
})
