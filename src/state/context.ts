import { StatePosition, State } from "../type"
import { deepEqual } from "../util/deepEqual"

let deepCopy = (value: any) => JSON.parse(JSON.stringify(value))

export let createContext = (state: State) => {
    let propertyUtilizationShelf: [
        (s: State) => unknown,
        unknown,
        (se: any, st: State) => unknown,
    ][] = []

    let positionShelf: ((s: StatePosition, st: State) => unknown)[] = []

    return {
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
                    console.log("useState.for:", propertyUtilizationShelf.length, "functions")
                },
            }
        },
        updateState(changer: (s: State) => void) {
            changer(state)
            // we push work to the event queue so that the current thread finishes first
            propertyUtilizationShelf.forEach(([selector, selection, runFunction]) => {
                let newSelection = selector(state)
                if (!deepEqual(newSelection, selection)) {
                    runFunction(newSelection, state)
                }
            })
            positionShelf.forEach((f) => {
                f(state, state)
            })
        },
        usePosition(runFunction: (pos: StatePosition, st: State) => unknown) {
            runFunction(state, state)
            positionShelf.push(runFunction)
            console.log("usePosition:", positionShelf.length, "functions")
        },
        updatePosition(changer: (p: StatePosition, st: State) => void) {
            changer(state, state)

            positionShelf.forEach((f) => {
                f(state, state)
            })
        },
    }
}

export type Context = ReturnType<typeof createContext>
