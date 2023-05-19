import { State, StatePosition } from "../stateType"
import { deepEqual } from "../util/deepEqual"

let deepCopy = (value: any) => JSON.parse(JSON.stringify(value))

/**
 * @param state the initial state to be held in the context
 * @returns a context instance for the state
 */
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
    /**
     * @param selector A function selecting the part of the state which is
     * required for keeping some part of the application up to date
     */
    use<T>(selector: (s: State) => T) {
      let selection = selector(state)
      let done = false
      return {
        /**
         * @param runFunction The function which will receive the output of the
         * selector and will use it to update some part of the application
         */
        for: (runFunction: (selection: T, state: State) => unknown) => {
          runFunction(selection, state)
          if (!done) {
            propertyUtilizationShelf.push([selector, deepCopy(selection), runFunction])
            done = true
          }
        },
      }
    },
    /**
     * Update the state held by the context and run all the needed callbacks
     * @param changer the update function which will receive the state
     */
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
    /**
     * Transform an update function into a parameter-less action
     * @param f the action function which updates the state
     * @returns a function devoid of parameters which perform a state update
     */
    action(f: (s: State) => void) {
      return () => {
        me.updateState(f)
      }
    },
    usePosition(runFunction: (pos: StatePosition, st: State) => unknown) {
      runFunction(state, state)
      positionShelf.push(runFunction)
      return () => {
        positionShelf = positionShelf.filter((fn) => fn !== runFunction)
      }
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
    /**
     * @returns the whole state held by the context
     */
    getState() {
      return state
    },
  }
  return me
}

export type Context = ReturnType<typeof createContext>
