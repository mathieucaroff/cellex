import * as assert from "assert"
import { TestAPI } from "vitest"

let error = (...args: any[]) => {
  console.error("", ...args)
  setTimeout(() => {}, 1000 * 1000)
}

export interface SuccessCase<TI, TO> {
  input: TI
  output: TO
  target: "success"
}

export interface FailureCase<TI> {
  input: TI
  output?: undefined
  target: "failure"
}

export let success = <T>(input: string, output: T): Case<string, T> => {
  return {
    input,
    target: "success",
    output,
  }
}

export let failure = <T>(input: string): Case<string, T> => {
  return {
    input,
    target: "failure",
  }
}

export type Case<TI = any, TO = any> = SuccessCase<TI, TO> | FailureCase<TI>

const PASSED = true
const FAILED = false
export let testEngine = <TI extends string, TO = any>(
  caseList: Case<TI, TO>[],
  createParser: () => { feed: (s: string) => void; results: readonly TO[] },
  it?: TestAPI,
) => {
  const test = it ?? ((name: string, f: () => boolean) => f())

  let casePass = caseList.filter(({ input, output, target }, k) => {
    let testResult = test(input, () => {
      let parser = createParser()
      if (!it) {
        console.log(`input: '${input}'`)
      }
      let results: TO[] = []
      let success: "success" | "failure" = "failure"
      let err: string = ""

      // Run
      try {
        parser.feed(input)
      } catch (e) {
        err = e as string
      }

      // Aquire results
      if (parser.results?.length > 0) {
        results.push(...parser.results)
        success = "success"
      } else {
        results = []
        success = "failure"
      }

      // Check success
      if (success !== target) {
        error(`expected: ${target}, got: ${success}`, err, results)
        return FAILED
      }
      if (success === "failure") {
        return PASSED
      }

      // Check result length
      if (results.length !== 1) {
        error(`number of results is not 1: it's ${results.length}`)
        return FAILED
      }

      // Check that result is deepEqual to expected output
      try {
        assert.deepEqual(results[0], output, `output|k: ${k}`)
      } catch (e) {
        error("!deepEqual\n:::got:::", results[0], "\nexpected:", output)
        return FAILED
      }

      // All check succeeded
      return PASSED
    })
    if (!it) {
      if (!testResult) {
        throw new Error("test")
      }
    }
  })
  if (!it) {
    console.log(`PASSED ${casePass.length}`)
    console.log(`TOTAL  ${caseList.length}`)
  }
}
