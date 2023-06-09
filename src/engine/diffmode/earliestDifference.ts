import { DiffModeSelection } from "../../diffType"
import { deepEqual } from "../../util/deepEqual"

// earliestDifference returns the first time at which there is a difference
// between the two change objects.
// If there is no difference, it returns **null**.
export function earliestDifference(
  a: DiffModeSelection["changes"],
  b: DiffModeSelection["changes"],
) {
  // compares the lines of each
  let k = 0
  let shortest = Math.min(a.length, b.length)
  while (deepEqual(a[k], b[k])) {
    k += 1
    if (k >= shortest) {
      return null
    }
  }
  return Math.min(a[k].t, b[k].t)
}
