// hoverManager helps with implementing the diffing

import { Context } from "../state/Context"

export interface DiffModeManagerProp {
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
    let { context } = prop

    // When diff mode is disabled, there's nothing to do.
    // When diff mode is enabled, we want to know whenever the mouse is over
    // either canvas and compute the corresponding (posT, posS) location.
    // In case of a mouse click, we want to lock the highlighted cell.
    // Clicking again anywhere but on the same line as the highlighted cell
    // should remove the lock.
    // Thus, there are three diff modes:
    // - off, disabled
    // - hovering, a single cell is selected
    // - locking, the cells of a line can be selected
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
            if (diffMode.status === "selection" && diffMode.s.length > 0) {
                // mode: locking
                if (eventKind !== "click") {
                    return
                }
                if (t === diffMode.t) {
                    // remove or add one cell
                    if (diffMode.s.includes(s)) {
                        diffMode.s = diffMode.s.filter((x) => x !== s)
                    } else {
                        diffMode.s.push(s)
                    }
                } else {
                    // unlock the cell, swith to the cell being hovered
                    diffMode = { status: "floating", s, t, diffState: diffMode.diffState }
                }
            } else {
                // mode: hovering
                if (eventKind === "click") {
                    if (typeof diffMode.s === "object") {
                        // we are not hovering over anything, there's nothing to do
                        return
                    }
                    // lock the cell
                    diffMode.s = [diffMode.s]
                } else if (eventKind === "leave") {
                    // reset
                    diffMode.s = []
                } else {
                    // move
                    diffMode.s = s
                    diffMode.t = t
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
