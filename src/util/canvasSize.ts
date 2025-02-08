import { CanvasSizeAdjust, ImmersiveMode } from "../stateType"
import { getUiSizing } from "../userinterface/UserInterface"

export function computeCanvasSize(
  window: Window,
  canvasSizeAdjust: CanvasSizeAdjust,
  immersiveMode: ImmersiveMode,
  uiBarClientHeight: number,
) {
  let width = window.innerWidth
  let height = window.innerHeight
  if (immersiveMode === "immersive") {
    return { width, height }
  }
  if (getUiSizing(window.innerWidth) === "sizeCLarge") {
    if (canvasSizeAdjust.desktopCanvasSize === "fixed") {
      return { width, height }
    }
    // else desktopCanvasSize is "adjust"
    width -= 70
    height -= 150
    return { width, height }
  }

  if (canvasSizeAdjust.phoneCanvasBottom === "gui") {
    let uiBarMargin = 22
    height -= uiBarClientHeight + uiBarMargin
  }

  return { width, height }
}
