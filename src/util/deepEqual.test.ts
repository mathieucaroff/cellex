import { expect, it } from "vitest"

import { deepEqual } from "./deepEqual"

it("compares arrays", () => {
  expect(deepEqual([], [])).toBe(true)
  expect(deepEqual([10], [10])).toBe(true)
  expect(deepEqual(["a", "z"], ["a", "z"])).toBe(true)

  expect(deepEqual(["a", "z"], ["a", ["z"]])).toBe(false)
})
