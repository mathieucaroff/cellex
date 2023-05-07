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

export let createPhoneDragManager = (prop: DragManagerProp) => {
  let { element, getDisplayInit } = prop
  let nop = () => {}

  let html = element.ownerDocument!.documentElement

  let init = {
    x: 0,
    y: 0,
  }
  let reset = {
    x: 0,
    y: 0,
  }

  let state: "up" | "down" = "up"

  let onMoveCallback: (xy: Pair) => void = nop

  // <handleStart>
  const handleStart = (ev: TouchEvent) => {
    reset = getDisplayInit()
    ev.stopImmediatePropagation()

    init = {
      x: reset.x + ev.touches[0].clientX,
      y: reset.y + ev.touches[0].clientY,
    }

    if (state === "up") {
      html.addEventListener("touchmove", handleMove, false)
      html.addEventListener("touchend", handleEnd, false)
      html.addEventListener("touchcancel", handleCancel, false)
    }
    state = "down"
  }

  element.addEventListener("touchstart", handleStart, false)

  let remove = () => {
    handleEnd()
    element.removeEventListener("touchstart", handleStart, false)
  }
  // </handleStart>

  // <handleMove> and <handleEnd>
  /**
   * handleMove and handleEnd are registered and unregistered each
   * time the user clicks and release the click.
   *
   * They are registered on `documentElement` (the `<html>` element).
   * This way the objet can be dragged even while the mouse is out of
   * the area of `element`.
   */
  const handleMove = (ev: TouchEvent) => {
    let x = init.x - ev.touches[0].clientX
    let y = init.y - ev.touches[0].clientY
    onMoveCallback({ x, y })
  }

  const handleEnd = () => {
    if (state == "down") {
      html.removeEventListener("touchmove", handleMove, false)
      html.removeEventListener("touchend", handleEnd, false)
      html.removeEventListener("touchcancel", handleCancel, false)
    }
    state = "up"
  }

  const handleCancel = () => {
    onMoveCallback(reset)
    handleEnd()
  }
  // </handleMove>, </handleEnd> and </handleCancel>

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
