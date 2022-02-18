export let clamp = (val: number, low: number, high: number) => {
    if (val < low) {
        return low
    } else if (val > high) {
        return high
    }
    return val
}
