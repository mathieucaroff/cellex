import { randrange } from "./randrange"

export type PerfectRandom = (pos: number, rangeSize: number) => number

export interface RandomMapper {
  top: PerfectRandom
  left: PerfectRandom
  right: PerfectRandom
}

export interface RandomMapperProp {
  seedString: string
}

/**
 * Random mapper creates three perfect random functions from a single seed.
 * The random of each of the three functions is independant. They are named:
 * - top
 * - left
 * - right
 */
export let createRandomMapper = (prop: RandomMapperProp) => {
  let { seedString } = prop

  let count = 3

  let perfectRandomFunction = (k: number): PerfectRandom => {
    return (pos: number, size: number) => {
      return randrange(seedString, pos * count + k, size)
    }
  }

  let me: RandomMapper = {
    top: perfectRandomFunction(0),
    left: perfectRandomFunction(1),
    right: perfectRandomFunction(2),
  }

  return me
}
