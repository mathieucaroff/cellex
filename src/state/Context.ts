import { StatePosition, State } from "../type"
import { deepEqual } from "../util/deepEqual"

let deepCopy = (value: any) => JSON.parse(JSON.stringify(value))

export let createContext = (state: State) => {
  let propertyUtilizationShelf: [
    (s: State) => unknown,
    unknown,
    (se: any, st: State) => unknown,
  ][] = []
  let updatingState = false

  let positionShelf: ((s: StatePosition, st: State) => unknown)[] = []
  let updatingPosition = false

  let me = {
    use<T>(selector: (s: State) => T) {
      let selection = selector(state)
      let done = false
      return {
        for: (runFunction: (selection: T, state: State) => unknown) => {
          runFunction(selection, state)
          if (!done) {
            propertyUtilizationShelf.push([selector, deepCopy(selection), runFunction])
            done = true
          }
        },
      }
    },
    updateState(changer: (s: State) => void) {
      if (updatingState) {
        changer(state)
        return
      }
      try {
        updatingState = true
        changer(state)
      } finally {
        updatingState = false
        // we push work to the event queue so that the current thread finishes first
        propertyUtilizationShelf.forEach((triplet) => {
          let [selector, selection, runFunction] = triplet
          let newSelection = selector(state)
          if (!deepEqual(newSelection, selection)) {
            runFunction(newSelection, state)
            triplet[1] = deepCopy(newSelection)
          }
        })
        positionShelf.forEach((f) => {
          f(state, state)
        })
      }
    },
    action(f: (s: State) => void) {
      return () => {
        me.updateState(f)
      }
    },
    usePosition(runFunction: (pos: StatePosition, st: State) => unknown) {
      runFunction(state, state)
      positionShelf.push(runFunction)
    },
    updatePosition(changer: (p: StatePosition, st: State) => void) {
      if (updatingPosition || updatingState) {
        changer(state, state)
        return
      }
      try {
        updatingPosition = true
        changer(state, state)
      } finally {
        updatingPosition = false
        positionShelf.forEach((f) => {
          f(state, state)
        })
      }
    },
    getState() {
      return state
    },
  }
  return me
}

export type Context = ReturnType<typeof createContext>
