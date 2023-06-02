import { DesktopOrMobile, Pair } from "../type"

// dragManager helps with implementing the canvas panning feature

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
  /**
   * whether the device running the app is a desktop-laptop or is a mobile phone
   */
  desktopOrMobile: DesktopOrMobile
}

export let createDragManager = (prop: DragManagerProp) => {
  let { element, getDisplayInit, desktopOrMobile } = prop
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
  /**
   * handleStart is registered once through the lifecycle of a DragManager.
   * It is registered only on the provided element.
   *
   * It is unregsitered when `.remove()` is called
   */
  const handleStart = (ev: MouseEvent & TouchEvent) => {
    reset = getDisplayInit()
    ev.stopImmediatePropagation()

    if (desktopOrMobile === "desktop") {
      init = {
        x: reset.x + ev.pageX,
        y: reset.y + ev.pageY,
      }

      if (state === "up") {
        html.addEventListener("mousemove", handleMove, false)
        html.addEventListener("mouseup", handleEnd, false)
      }
    } else {
      init = {
        x: reset.x + ev.touches[0].clientX,
        y: reset.y + ev.touches[0].clientY,
      }

      if (state === "up") {
        html.addEventListener("touchmove", handleMove, false)
        html.addEventListener("touchend", handleEnd, false)
        html.addEventListener("touchcancel", handleCancel, false)
      }
    }
    state = "down"
  }

  if (desktopOrMobile === "desktop") {
    element.addEventListener("mousedown", handleStart, false)
  } else {
    element.addEventListener("touchstart", handleStart, false)
  }

  let remove = () => {
    handleEnd()

    if (desktopOrMobile === "desktop") {
      element.removeEventListener("mousedown", handleStart, false)
    } else {
      element.removeEventListener("touchstart", handleStart, false)
    }
  }
  // </handleStart>

  // <handleMove>, <handleEnd> and <handleCancel>
  /**
   * handleMove and handleEnd are registered and unregistered each
   * time the user clicks and release the click.
   *
   * They are registered on `documentElement` (the `<html>` element).
   * This way the objet can be dragged even while the mouse is out of
   * the area of `element`.
   */
  const handleMove = (ev: MouseEvent & TouchEvent) => {
    if (desktopOrMobile === "desktop") {
      let x = init.x - ev.pageX
      let y = init.y - ev.pageY
      onMoveCallback({ x, y })
    } else {
      let x = init.x - ev.touches[0].clientX
      let y = init.y - ev.touches[0].clientY
      onMoveCallback({ x, y })
    }
  }

  const handleEnd = () => {
    if (state == "down") {
      if (desktopOrMobile === "desktop") {
        html.removeEventListener("mousemove", handleMove, false)
        html.removeEventListener("mouseup", handleEnd, false)
      } else {
        html.removeEventListener("touchmove", handleMove, false)
        html.removeEventListener("touchend", handleEnd, false)
        html.removeEventListener("touchcancel", handleCancel, false)
      }
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
