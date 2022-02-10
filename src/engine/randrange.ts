import { xxHash32 } from "js-xxhash"

/**
 * deterministically compute an apparently random number in the given range,
 * from a seed consisting of a string and an integer
 * @param seedString some string used to deterministically produce the random output
 * @param seedInt some int used to deterministically produce the random output
 * @param rangeSize the size of the range output
 * @returns a number between {0} included and {rangeSize} excluded
 */
export let randrange = (seedString: string, seedInt: number, rangeSize: number) => {
    let randomInt32: number // output of xxHash32
    let res: number // result of the function
    let limit = 2 ** 32 // xxHash32 biggest possible output plus one
    let valid: boolean = false // whether the result is valid
    let currentSeed = seedInt

    let k = 0
    while (!valid) {
        randomInt32 = xxHash32(seedString, currentSeed)
        res = randomInt32 % rangeSize
        valid = randomInt32 - res + rangeSize < limit
        currentSeed = randomInt32

        if (k == 1) {
            console.warn("randrange didn't succeed with the first seed", {
                seedString,
                seedInt,
                rangeSize,
            })
        } else if (k > 1 && k < 9) {
            console.warn({ randomInt32, res, valid })
        } else if (k >= 9) {
            console.error("randrange failed to converge", {
                seedString,
                seedInt,
                rangeSize,
            })
            return 0
        }

        k += 1
    }

    return res!
}

export type Randrange = typeof randrange
