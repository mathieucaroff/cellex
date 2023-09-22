import { Remover } from "../type"

export interface KeyboardManagerProp {
  /** Which element to should carry the event listener */
  element: Element
  /** Which property of the event use to index the event map */
  evKeyPropName: keyof KeyboardEvent
  /** Whether the listener should be triggered during the capturing phase or during the bubbling phase */
  capture: boolean
  /** Whether the event should be ignored */
  ignoreEvent: (ev: KeyboardEvent) => boolean
  /** Normalize the key before it is used to lookup the handler. It is usually
   * used to perform .toLowerCase() or .toUpperCase()
   */
  normalize: (key: string) => string
}

export interface KeyboardManager {
  onKeydown: (key: string, callback: () => void) => Remover
  onBoth: (prop: { key: string; keydown: () => void; keyup: () => void }) => Remover
}

export let createKeyboardManager = (prop: KeyboardManagerProp) => {
  let { element, evKeyPropName, capture, normalize, ignoreEvent } = prop

  type EventMap = Record<string, (() => void) | undefined>
  let onKeydownMap: EventMap = {}
  let onKeyupMap: EventMap = {}

  let eventHandler = (closureName: string, onEventMap: EventMap) => (evt: Event) => {
    let ev = evt as KeyboardEvent
    if (ignoreEvent(ev)) {
      return
    }
    let key = normalize(String(ev[evKeyPropName]))
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
      key = normalize(key)
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

    onBoth: (prop: { key: string; keydown: () => void; keyup: () => void }) => {
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
