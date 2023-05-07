export let randomChoice = (optionSet: number[]) => {
  return optionSet[Math.floor(Math.random() * optionSet.length)]
}
