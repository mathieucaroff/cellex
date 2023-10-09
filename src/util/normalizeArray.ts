export function normalizeArray(array: number[], base: number) {
  for (let k = array.length - 1; k >= 0; k--) {
    let quotient: number
    if (array[k] >= 0) {
      quotient = Math.floor(array[k] / base)
    } else {
      quotient = -Math.floor((base - array[k]) / base)
    }
    array[k] -= quotient * base
    if (k > 0) {
      // apply the carry
      array[k - 1] += quotient
    }
  }
  if (array.some((v) => isNaN(v))) {
    return
  }
}
