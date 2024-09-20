import { expect, it } from "vitest"

export function testUnit<TInput, TOutput>(
  unitUnderTest: (input: TInput) => TOutput,
  reverseUnitTest?: (output: TOutput) => TInput,
) {
  function test(
    input: TInput,
    target: "failure" | "success" | "revert" | "successRevert",
    output?: TOutput,
  ) {
    it(JSON.stringify(input), () => {
      if (target === "success" || target === "successRevert") {
        expect(unitUnderTest(input)).toEqual(output)
      } else {
        expect(() => unitUnderTest(input)).toThrow()
      }
    })
    it("REV:" + JSON.stringify(input), () => {
      if (target === "revert" || target === "successRevert") {
        if (reverseUnitTest) {
          expect(reverseUnitTest(output)).toEqual(input)
        } else {
          throw new Error("reverseUnitTest not provided")
        }
      }
    })
  }
  return {
    success: (input: TInput, output: TOutput) => {
      test(input, "success", output)
    },
    revert: (input: TInput, output: TOutput) => {
      test(input, "revert", output)
    },
    successRevert: (input: TInput, output: TOutput) => {
      test(input, "successRevert", output)
    },
    failure: (input: TInput) => {
      test(input, "failure")
    },
  }
}
