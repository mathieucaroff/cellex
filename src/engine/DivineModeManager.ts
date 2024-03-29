// DivineModeManager handles the mouse events to keep the state up to date
import { DivineMode } from "../divineType"
import { Context } from "../state/Context"

export interface DivineModeManagerProp {
  context: Context
}

export type GetST = (x: number, y: number) => { s: number; t: number }

/** Obtain the position (x, y), of a mouse event, relative to an html element */
export let getPosition = (ev: MouseEvent, element: HTMLElement) => {
  let rect = element.getBoundingClientRect()
  let x = ev.clientX - rect.left //x position within the element.
  let y = ev.clientY - rect.top //y position within the element.
  return { x, y }
}

/**
 * divineModeManager updates the divine mode state from mouse events.
 *
 * @param element the element for which we want to listen for hovering and click events
 * @param handler the function which receives the event
 * @returns
 */
export let createDivineModeManager = (prop: DivineModeManagerProp) => {
  let { context } = prop

  // When divine mode is disabled, there's nothing to do.
  // When divine mode is enabled, we want to know whenever the mouse is over
  // either canvas and compute the corresponding (posT, posS) location.
  // In case of a mouse click, we want to lock the highlighted cell.
  // Clicking again anywhere but on the same line as the highlighted cell
  // should remove the lock.
  // Thus, there are three divine modes:
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
      let { divineMode } = context.getState()
      if (divineMode.status === "off") {
        return
      }

      let rect = element.getBoundingClientRect()
      var x = ev.clientX - rect.left
      var y = ev.clientY - rect.top
      let { s, t } = getST(x, y)
      if (divineMode.status === "selection") {
        // mode: locking
        if (eventKind !== "click") {
          return
        }
        let tIndex = 0
        divineMode.changes.some((changes) => {
          if (changes.t < t) {
            tIndex += 1
            return
          }
          return true
        })

        let lineChanges = divineMode.changes[tIndex]

        if (!lineChanges || lineChanges.t !== t) {
          // Simplest case: the line doesn't exist in the set of modified lines
          divineMode.changes.splice(tIndex, 0, { t, changes: [{ s, amount: 1 }] })
        } else {
          let sIndex = 0
          lineChanges.changes.some((changes) => {
            if (changes.s < s) {
              sIndex += 1
              return
            }
            return true
          })

          let cellChanges = lineChanges.changes[sIndex]
          if (!cellChanges || cellChanges.s !== s) {
            // Second case: the line exists, but not the cell
            lineChanges.changes.splice(sIndex, 0, { s, amount: 1 })
          } else {
            let {
              automaton: { stateCount },
            } = context.getState()
            cellChanges.amount = (cellChanges.amount + 1) % stateCount
            if (cellChanges.amount > 0) {
              // Third case: the line and the cell both exist and the new amount is non-zero
              // -- nothing to do
            } else {
              // The new amount is zero => remove the cell from the line
              lineChanges.changes.splice(sIndex, 1)
              if (lineChanges.changes.length > 0) {
                // Fourth case: there are more cells in the line
                // -- nothing to do
              } else {
                // That cell is the last of the line => remove the **line** from the divine mode changes
                divineMode.changes.splice(tIndex, 1)
                if (divineMode.changes.length > 0) {
                  // Fifth case: there are other lines in the divine mode changes
                  // -- nothing to do
                } else {
                  // Sixth and final case: there are no more lines in the divine mode changes
                  // go back to the hovering mode

                  // It is not obvious for the user that the mode has changed to hovering, so
                  // we flash the propagation to make it obvious.
                  let temporaryDivineMode: DivineMode = {
                    status: "waiting",
                    active: false,
                    propagation: divineMode.propagation,
                  }
                  let finalDivineMode: DivineMode = {
                    status: "hovering",
                    active: true,
                    propagation: divineMode.propagation,
                    changes: [{ t, changes: [{ s, amount: 1 }] }],
                  }

                  divineMode = temporaryDivineMode
                  setTimeout(() => {
                    context.updateState((state) => {
                      state.divineMode = finalDivineMode
                    })
                  }, 100)
                }
              }
            }
          }
        }
        // ensure the reference is changed so that updates which rely on divineMode
        // are performed
        divineMode = { ...divineMode }
      } else {
        if (eventKind === "leave") {
          divineMode = { status: "waiting", active: false, propagation: divineMode.propagation }
        } else if (eventKind === "move") {
          divineMode = {
            status: "hovering",
            active: true,
            propagation: divineMode.propagation,
            changes: [{ t, changes: [{ s, amount: 1 }] }],
          }
        } else if (eventKind === "click") {
          divineMode = {
            status: "selection",
            active: true,
            propagation: divineMode.propagation,
            changes: [{ t, changes: [{ s, amount: 1 }] }],
          }
        }
      }
      context.updateState((state) => {
        state.divineMode = divineMode
      })
    }
  return {
    /** Given:
     * - an Html Element,
     * - a function which maps the coordinates inside the Html Element to the
     *   coordinates of pixels in the image,
     * call the hover, leave and click handlers provided at the initialization
     * of the divine mode manager.
     */
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
