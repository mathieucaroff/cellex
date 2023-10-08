import { ChangeSet } from "../../diffType"
import { deepEqual } from "../../util/deepEqual"

/** earliestDifference returns the first time at which there is a difference
    between the two change objects.
    If there is no difference, it returns **null**. */
export function earliestDifference(a: ChangeSet, b: ChangeSet) {
  // compare the lines of each change set and return when the
  // first difference is encountered
  let k = 0
  let shortest = Math.min(a.length, b.length)
  while (deepEqual(a[k], b[k])) {
    k += 1
    if (k >= shortest) {
      return null
    }
  }
  return Math.min(a[k]?.t ?? 0, b[k]?.t ?? 0)
}
