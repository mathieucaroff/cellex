import { colorToHexColor, hexColorToColor } from "../engine/color"
import { Engine } from "../engine/Engine"
import { fillImage } from "./fill"
import { Color } from "../type"

export let presentColorMap = (colorMap) => colorMap.map((c) => colorToHexColor(c)).join(";")
export let parseColorMap = (colorString) => colorString.split(";").map((h) => hexColorToColor(h))

export let createDisplay = (canvas: HTMLCanvasElement, zoomCanvas: HTMLCanvasElement) => {
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
        draw(x: number, yy: number, zoom: number, colorMap: Color[], redraw: boolean) {
            // y is the integer y position
            let y = Math.floor(yy)
            // ey is the small y position (between 0 and 1)
            let ey = yy % 1
            let { width, height } = canvas
            let deltaX = x - lastX
            let deltaY = y - lastY

            if (redraw) {
                // fill the whole canvas at the current coordinates
                fillImage(engine, ctx, width, width, height, 0, 0, x, y, colorMap)
                lastX = x
                lastY = y
            }

            // move image in canvas
            ctx.drawImage(canvas, -deltaX, -deltaY)

            // create new imagery where there's none
            if (deltaX != 0) {
                // Vertical empty band
                let imageWidth = Math.min(Math.abs(deltaX), width)
                let baseX = deltaX > 0 ? Math.max(width - deltaX, 0) : 0
                fillImage(engine, ctx, width, imageWidth, height, baseX, 0, x, y, colorMap)
            }

            if (deltaY != 0) {
                // Horizontal empty band
                let imageHeight = Math.min(Math.abs(deltaY), height)
                let baseY = deltaY > 0 ? Math.max(height - deltaY, 0) : 0
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
            zoomCtx.fillStyle = "#FFFFFF"
            zoomCtx.fillRect(0, 0, zoomCanvas.width, zoomCanvas.height)
            zoomCtx.drawImage(canvas, sx, sy, sw, sh, 1, 0, dw, dh)
        },
        drawZoomAreaBoundary(zoom: number) {
            let sx = (canvas.width - zoomCanvas.width / zoom) / 2
            ctx.strokeStyle = "#00FF00" // green
            ctx.strokeRect(sx, 0, zoomCanvas.width / zoom, zoomCanvas.height / zoom)
        },
    }
}
