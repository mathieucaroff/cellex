import { Remover } from "../type"

export interface KeyboardManagerProp {
    element: Element
    evPropName: keyof KeyboardEvent
    capture: boolean
}

export interface KeyboardManager {
    onKeydown: (key: string, callback: () => void) => Remover
    onBoth: (prop: { key: string; keydown: () => void; keyup: () => void }) => Remover
}

export let createKeyboardManager = (prop: KeyboardManagerProp) => {
    let { element, evPropName, capture } = prop

    type EventMap = Record<string, (() => void) | undefined>
    let onKeydownMap: EventMap = {}
    let onKeyupMap: EventMap = {}

    let eventHandler = (closureName: string, onEventMap: EventMap) => (ev) => {
        let key = "" + ev[evPropName]
        let handler = onEventMap[key]
        if (handler !== undefined) {
            handler()
            ev.preventDefault()
        }
    }

    let handleKeydown = eventHandler("down", onKeydownMap)
    let handleKeyup = eventHandler("up", onKeyupMap)

    element.addEventListener("keydown", handleKeydown, capture)
    element.addEventListener("keyup", handleKeyup, capture)

    let removeAll = () => {
        element.removeEventListener("keydown", handleKeydown, capture)
        element.removeEventListener("keyup", handleKeyup, capture)
    }

    return {
        onKeydown: (key: string, callback: () => void) => {
            if (onKeydownMap[key] !== undefined) {
                throw new Error(`keyboard event ${key}(down) assigned twice`)
            }
            onKeydownMap[key] = callback

            return {
                remove: () => {
                    delete onKeydownMap[key]
                },
            }
        },

        onBoth: (prop) => {
            let { key, keydown, keyup } = prop
            if (onKeydownMap[key] !== undefined) {
                throw new Error(`keyboard event ${key}(down) assigned twice`)
            }
            if (onKeyupMap[key] !== undefined) {
                throw new Error(`keyboard event ${key}(up) assigned twice`)
            }

            onKeydownMap[key] = keydown
            onKeyupMap[key] = keyup

            return {
                remove: () => {
                    delete onKeydownMap[key]
                    delete onKeyupMap[key]
                },
            }
        },
        removeAll,
    }
}
