/**
 * Add one to the number represented by the given array, respecting the given base by propagating any value in excess towards the higher former of the array.
 *
 * @param array An array representing a number in the given base. Each location in the array must be lower than the base.
 * @param base
 */
export let addOne = (array: number[], base: number) => {
    array[array.length - 1] += 1

    for (let k = array.length - 1; k >= 0; k--) {
        if (array[k] < base) {
            break // good end
        }
        array[k] %= base
        if (k > 0) {
            // apply the carry
            array[k - 1] += 1
        }
    }
}

/**
 * Subrtacton one from the given array, propagating the carries as needed.
 * @param array
 * @param base
 */
export let subtractOne = (array: number[], base: number) => {
    array[array.length - 1] -= 1
    for (let k = array.length - 1; k >= 0; k--) {
        if (array[k] >= 0) {
            break // good end
        }
        array[k] = ((array[k] % base) + base) % base
        if (k > 0) {
            // apply the carry
            array[k - 1] -= 1
        }
    }
}
