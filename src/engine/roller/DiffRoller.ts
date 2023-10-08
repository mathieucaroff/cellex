import { BasicRoller, DiffRoller } from "../../engineType"

/** createAutomatonEngine creates a 1d automaton computing machine for the given
    automaton, topology, and source of randomness */
export let createDiffRoller = (firstRoller: BasicRoller, secondRoller: BasicRoller): DiffRoller => {
  return {
    getLine: (t: number): Uint8Array => {
      let a = firstRoller.getLine(t)
      let b = secondRoller.getLine(t)
      a.forEach((v, k) => {
        if (v !== b[k]) {
          a[k] = 6
        }
      })
      return a
    },
  }
}
