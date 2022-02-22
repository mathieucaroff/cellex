// Add one
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

// Subtract one
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
