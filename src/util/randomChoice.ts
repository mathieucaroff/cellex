export let randomChoice = <T>(optionSet: T[]) => {
  return optionSet[Math.floor(Math.random() * optionSet.length)]
}

export let weightedRandomChoice = <T>(optionArray: [number, T][]) => {
  let totalWeight = optionArray.reduce((accumulator, [weight]) => accumulator + weight, 0)
  if (totalWeight <= 0) {
    throw new Error("the total weight must be strictly positive to carry out the random choice")
  }
  let randomValue = Math.floor(Math.random() * totalWeight)
  for (let [weight, value] of optionArray) {
    randomValue -= weight
    if (randomValue < 0) {
      return value
    }
  }
}
