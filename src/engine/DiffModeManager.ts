// hoverManager helps with implementing the diffing

import { Context } from "../state/Context"

export interface DiffModeManagerProp {
  baseDiffState: number
  context: Context
}

export type GetST = (x: number, y: number) => { s: number; t: number }

export let getPosition = (ev: MouseEvent, element: HTMLElement) => {
  let rect = element.getBoundingClientRect()
  let x = ev.clientX - rect.left //x position within the element.
  let y = ev.clientY - rect.top //y position within the element.
  return { x, y }
}

/**
 *
 * @param element the element for which we want to listen for hovering and click events
 * @param handler the function which receives the event
 * @returns
 */
export let createDiffModeManager = (prop: DiffModeManagerProp) => {
  let { baseDiffState, context } = prop

  // When diff mode is disabled, there's nothing to do.
  // When diff mode is enabled, we want to know whenever the mouse is over
  // either canvas and compute the corresponding (posT, posS) location.
  // In case of a mouse click, we want to lock the highlighted cell.
  // Clicking again anywhere but on the same line as the highlighted cell
  // should remove the lock.
  // Thus, there are three diff modes:
  // - "off", disabled
  // - "hovering", a single cell is selected
  // - "selection" the cells of a line can be selected (locking)
  // + "waiting", after the mode is toggled on, but before a cell is hovered
  //
  // When "off" there are no interaction with any canvas. Nothing to do.
  // When "hovering", the pointer must be tracked and in case of a click, the
  // must be selection locked, and if the mouse leaves, the mode must be
  // switched to "waiting".
  // When "waiting", in case of a move the mode must be switched to "hovering"
  // and in case of a click, it must be switched to "selection".
  // When "selection", in case of a *click* the time must be inspected to know
  // whether to edit the selection or to switch to "hovering".
  let handler =
    (
      //
      eventKind: "move" | "leave" | "click",
      element: HTMLElement,
      getST: GetST,
    ) =>
    (ev: MouseEvent) => {
      let { diffMode } = context.getState()
      if (diffMode.status === "off") {
        return
      }

      let rect = element.getBoundingClientRect()
      var x = ev.clientX - rect.left
      var y = ev.clientY - rect.top
      let { s, t } = getST(x, y)
      if (diffMode.status === "selection") {
        // mode: locking
        if (eventKind !== "click") {
          return
        }
        if (t === diffMode.t) {
          // edit the selection: remove or add one cell
          if (diffMode.s.includes(s)) {
            diffMode.s = diffMode.s.filter((x) => x !== s)
          } else {
            diffMode.s.push(s)
          }
        } else {
          // switch the mode to hovering
          diffMode = { status: "hovering", s, t, diffState: diffMode.diffState }
        }
      } else {
        if (eventKind === "leave") {
          diffMode = { status: "waiting" }
        } else if (eventKind === "move") {
          diffMode = { status: "hovering", s, t, diffState: baseDiffState }
        } else if (eventKind === "click") {
          diffMode = { status: "selection", s: [s], t, diffState: baseDiffState }
        }
      }
      context.updateState((state) => {
        state.diffMode = diffMode
      })
    }
  return {
    addCanvas: (element: HTMLElement, getST: GetST) => {
      let hoverHandler = handler("move", element, getST)
      let leaveHandler = handler("leave", element, getST)
      let clickHandler = handler("click", element, getST)
      element.addEventListener("mousemove", hoverHandler, true)
      element.addEventListener("mouseleave", leaveHandler, true)
      element.addEventListener("click", clickHandler, true)
      let remove = () => {
        element.addEventListener("mousemove", hoverHandler, true)
        element.addEventListener("mousemove", leaveHandler, true)
        element.addEventListener("click", clickHandler, true)
      }
      return remove
    },
  }
}
