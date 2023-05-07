import * as assert from "assert"

let error = (...args) => {
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

export let failure = <T>(input): Case<string, T> => {
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
  createParser: () => nearley.Parser,
) => {
  let casePass = caseList.filter(({ input, output, target }, k) => {
    let parser = createParser()
    console.log(`input: '${input}'`)
    let results: TO[] = []
    let success: "success" | "failure" = "failure"
    let err: string = ""

    // Run
    try {
      parser.feed(input)
    } catch (e) {
      err = e
    }

    // Aquire results
    if (parser.results?.length > 0) {
      results = parser.results
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
  console.log(`PASSED ${casePass.length}`)
  console.log(`TOTAL  ${caseList.length}`)
}
