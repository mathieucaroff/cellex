import { Engine } from "../engine/engine"
import { Context } from "../state/context"
import { fillImage } from "./fill"

export let createDisplay = (
    context: Context,
    canvas: HTMLCanvasElement,
    zoomCanvas: HTMLCanvasElement,
) => {
    let ctx = canvas.getContext("2d")!
    let zoomCtx = zoomCanvas.getContext("2d")!
    let engine: Engine

    let lastX: number = 0
    let lastY: number = 0

    return {
        setEngine(newEngine: Engine) {
            engine = newEngine
        },
        /**
         *
         * @param x the x position of the camera over the simulation (integer)
         * @param yy the y position of the camera (float)
         * @param redraw whether the display needs a full redraw
         */
        draw(x: number, yy: number, redraw: boolean) {
            // y is the integer y position
            let y = Math.floor(yy)
            // ey is the small y position (between 0 and 1)
            let ey = yy % 1
            let { width, height } = canvas
            let { zoom, colorMap } = context.getState()
            let deltaX = x - lastX
            let deltaY = y - lastY

            if (redraw) {
                fillImage(engine, ctx, width, width, height, 0, 0, x, y, colorMap)
                lastX = x
                lastY = y
            }

            // move image in canvas
            ctx.drawImage(canvas, -deltaX, -deltaY)

            // create new imagery where there's none
            if (deltaX != 0) {
                // Vertical empty band
                let imageWidth = Math.abs(deltaX)
                let baseX = deltaX > 0 ? width - deltaX : 0
                fillImage(engine, ctx, width, imageWidth, height, baseX, 0, x, y, colorMap)
            }

            if (deltaY != 0) {
                // Horizontal empty band
                let imageHeight = Math.abs(deltaY)
                let baseY = deltaY > 0 ? height - deltaY : 0
                fillImage(engine, ctx, width, width, imageHeight, 0, baseY, x, y, colorMap)
            }

            lastX = x
            lastY = y

            // draw to zoom canvas
            zoomCtx.imageSmoothingEnabled = false
            let sx = (canvas.width - zoomCanvas.width / zoom) / 2
            let sy = ey
            let sw = zoomCanvas.width / zoom
            let sh = zoomCanvas.height / zoom
            let dw = zoomCanvas.width
            let dh = zoomCanvas.height
            zoomCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, dw, dh)
        },
    }
}
