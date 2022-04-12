import { Pair } from "../../type"

// dragManager helps with implementing the panning and canvas resizing features

export interface DragManagerProp {
    /**
     * the element for which we want to listen for "drag events"
     */
    element: HTMLElement
    /**
     * the function to run at the beginning of the drag
     * to know the position of the thing being dragged at that
     */
    getDisplayInit: () => Pair
}

export let createDesktopDragManager = (prop: DragManagerProp) => {
    let { element, getDisplayInit } = prop
    let nop = () => {}

    let html = element.ownerDocument!.documentElement

    let init = {
        x: 0,
        y: 0,
    }

    let state: "up" | "down" = "up"

    let onMoveCallback: (xy: Pair) => void = nop

    // <handleDown>
    /**
     * handleDown is registered once through the lifecycle of a DragManager.
     * It is registered only on the provided element.
     *
     * It is unsubscribed when `.remove()` is called
     */
    const handleDown = (ev: MouseEvent) => {
        let { x, y } = getDisplayInit()
        ev.stopImmediatePropagation()

        init = {
            x: x + ev.pageX,
            y: y + ev.pageY,
        }

        if (state === "up") {
            html.addEventListener("mousemove", handleMove, false)
            html.addEventListener("mouseup", handleUp, false)
        }
        state = "down"
    }

    element.addEventListener("mousedown", handleDown, false)

    let remove = () => {
        handleUp()
        element.removeEventListener("mousedown", handleDown, false)
    }
    // </handleDown>

    // <handleMove> and <handleUp>
    /**
     * handleMove and handleUp are registered and unregistered each
     * time the user clicks and release the click.
     *
     * They are registered on `documentElement` (the `<html>` element).
     * This way the objet can be dragged even while the mouse is out of
     * the area of `element`.
     */
    const handleMove = (ev: MouseEvent) => {
        let x = init.x - ev.pageX
        let y = init.y - ev.pageY
        onMoveCallback({ x, y })
    }

    const handleUp = () => {
        if (state == "down") {
            html.removeEventListener("mousemove", handleMove, false)
            html.removeEventListener("mouseup", handleUp, false)
        }
        state = "up"
    }
    // </handleMove> and </handleUp>

    return {
        onMove: (f: (xy: Pair) => void) => {
            if (onMoveCallback !== nop) {
                console.error("move callback function already set", new Error().stack)
            }
            onMoveCallback = f
        },
        remove,
    }
}
