import { expect, it } from "vitest"

export function testUnit<TInput, TOutput>(unitUnderTest: (input: TInput) => TOutput) {
  function test(input: TInput, target: "failure" | "success", output?: TOutput) {
    it(JSON.stringify(input), () => {
      if (target === "success") {
        expect(unitUnderTest(input)).toEqual(output)
      } else {
        expect(() => unitUnderTest(input)).toThrow()
      }
    })
  }
  return {
    success: (input: TInput, output: TOutput) => {
      test(input, "success", output)
    },
    failure: (input: TInput) => {
      test(input, "failure")
    },
  }
}
