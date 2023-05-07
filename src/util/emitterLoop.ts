/**
 *
 * @param schedulingFunction A function such as 'requestAnimationFrame', which
 * will run its callback after a time. It could also be for instance:
 * `(f) => setTimeout(f, 99)`. The point is that `schedulingFunction` must take
 * a function as parameter, and must run it after a time.
 *
 * emitterLoop will make transform that scheduling Function into an EventEmitter
 * by making it schedule its next run each time.
 *
 * an emitterLoop can only be subsribed once, using `.link()`, and it can then
 * be discarded using `.discard()` on the object returned by `.link()`. The
 * `discard` method is also available on the emitterLoop object, for situations
 * where you want to start a loop, but later decide not to subscribe anything to
 * it.
 *
 * trying to use `.link()` on an emitterLoop which has already been subsribed
 * to, or which has already been discarded will result in an error being throw
 */
export let emitterLoop = (schedulingFunction: (f: () => any) => any) => {
  let f = () => {}
  let status: "empty" | "inUse" | "discarded" = "empty"

  let loop = () => {
    schedulingFunction(loop)
    f()
  }

  loop()

  let link = (subscriber: () => any) => {
    if (status === "empty") {
      f = subscriber
      status = "inUse"
      return {
        discard,
      }
    } else if (status === "inUse") {
      throw new Error("This emitter loop has already been subsribed to")
    } else {
      throw new Error("This emitter loop has already been used and unlinked")
    }
  }

  let discard = () => {
    f = () => {}
    loop = () => {}
    status = "discarded"
  }

  return {
    discard,
    link,
  }
}
