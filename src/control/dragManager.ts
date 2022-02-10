import { Pair } from "../type"

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

export let createDragManager = (prop: DragManagerProp) => {
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

        init = {
            x: x + ev.pageX,
            y: y + ev.pageY,
        }

        if (state === "up") {
            html.addEventListener("mousemove", handleMove, true)
            html.addEventListener("mouseup", handleUp, true)
        }
        state = "down"
    }

    element.addEventListener("mousedown", handleDown, true)

    let remove = () => {
        handleUp()
        element.removeEventListener("mousedown", handleDown, true)
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
            html.removeEventListener("mousemove", handleMove, true)
            html.removeEventListener("mouseup", handleUp, true)
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
