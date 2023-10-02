import { Engine } from "../engine/Engine"
import { colorToHexColor, hexColorToColor } from "../engine/color"
import { Color } from "../type"
import { mod } from "../util/mod"
import { fillImage } from "./fill"

export let presentColorMap = (colorMap) => colorMap.map((c) => colorToHexColor(c)).join(";")
export let parseColorMap = (colorString) => colorString.split(";").map((h) => hexColorToColor(h))

export let createDisplay = (canvas: HTMLCanvasElement) => {
  let ctx = canvas.getContext("2d")!

  // the precanvas is used for the non-zoomed-up rendering, after which its
  // content is then scaled up and written to the visible canvas
  let preCanvas = document.createElement("canvas")
  let preCtx = preCanvas.getContext("2d")!

  let engine: Engine

  let lastX = 0
  let lastY = 0
  let lastZoomX = Infinity

  /**
   * preDraw -- draw to the preCanvas
   */
  const preDraw = (
    x: number,
    y: number,
    zoomX: number,
    zoomY: number,
    colorMap: Color[],
    redraw: boolean,
  ) => {
    // size
    let { width, height } = canvas
    let preWidth = Math.ceil(width / zoomX) + 1
    let preHeight = Math.ceil(height / zoomY) + 1
    if (preCanvas.width !== preWidth || preCanvas.height !== preHeight) {
      preCanvas.width = preWidth
      preCanvas.height = preHeight
      redraw = true
    }

    let deltaX = x - lastX
    let deltaY = y - lastY

    if (redraw) {
      // fill the whole canvas at the current coordinates
      fillImage(engine, preCtx, preWidth, preHeight, 0, 0, x, y, colorMap)
      lastX = x
      lastY = y
      return
    }

    // move the image in the canvas
    preCtx.drawImage(preCanvas, -deltaX, -deltaY)

    // create new imagery where there's none
    if (deltaX !== 0) {
      // Vertical empty band
      let imageWidth = Math.min(Math.abs(deltaX), preWidth)
      let baseX = deltaX > 0 ? Math.max(preWidth - deltaX, 0) : 0
      fillImage(engine, preCtx, imageWidth, preHeight, baseX, 0, x, y, colorMap)
    }

    if (deltaY !== 0) {
      // Horizontal empty band
      let imageHeight = Math.min(Math.abs(deltaY), preHeight)
      let baseY = deltaY > 0 ? Math.max(preHeight - deltaY, 0) : 0
      fillImage(engine, preCtx, preWidth, imageHeight, 0, baseY, x, y, colorMap)
    }

    lastX = x
    lastY = y
  }

  /**
   * scaleUpDraw -- scale the precanvas up to the visible canvas
   */
  const scaleUpDraw = (fx: number, fy: number, zoomX: number, zoomY: number) => {
    ctx.drawImage(
      preCanvas,
      -fx * zoomX,
      -fy * zoomY,
      preCanvas.width * zoomX,
      preCanvas.height * zoomY,
    )
  }

  return {
    setEngine(newEngine: Engine) {
      engine = newEngine
    },
    /**
     *
     * @param xx the x position of the camera over the simulation (float)
     * @param yy the y position of the camera (float)
     * @param zoomX the number of pixels of the horizontal side of a cell
     * @param zoomY the number of pixels of the vertical side of a cell
     * @param colorMap an array specifying the color to use for each state number
     * @param redraw whether the display needs a full redraw
     */
    draw(xx: number, yy: number, zoomX: number, zoomY: number, colorMap: Color[], redraw: boolean) {
      // position
      // x, y is the integer x / y position
      let x = Math.floor(xx)
      let y = Math.floor(yy)
      // fx, fy is the fractional x / y position (between 0 and 1)
      let fx = mod(xx, 1)
      let fy = mod(yy, 1)

      if (zoomX < lastZoomX || redraw) {
        ctx.fillStyle = "#111"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      lastZoomX = zoomX
      preDraw(x, y, zoomX, zoomY, colorMap, redraw)
      scaleUpDraw(fx, fy, zoomX, zoomY)
    },
  }
}
