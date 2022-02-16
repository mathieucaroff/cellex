import { Engine } from "../engine/engine"
import { Context } from "../state/context"
import { fillImage } from "./fill"

export let createDisplay = (context: Context, canvas: HTMLCanvasElement) => {
    let ctx = canvas.getContext("2d")!
    let engine: Engine

    function init() {
        let { colorMap } = context.getState()
        fillImage(engine, ctx, canvas.width, canvas.width, canvas.height, 0, 0, 0, 0, colorMap) // 148/4
    }

    let lastX: number = 0
    let lastY: number = 0
    function draw(x: number, y: number, redraw: boolean) {
        let { width, height } = canvas
        let deltaX = x - lastX
        let deltaY = y - lastY

        if (redraw) {
            fillImage(engine, ctx, width, width, height, 0, 0, x, y, context.getState().colorMap)
            lastX = x
            lastY = y
            return
        }

        ctx.drawImage(canvas, -deltaX, -deltaY)

        // create new imagery where there's none
        if (deltaX != 0) {
            // Vertical empty band
            let imageWidth = Math.abs(deltaX)
            let baseX = deltaX > 0 ? width - deltaX : 0
            fillImage(
                engine,
                ctx,
                width,
                imageWidth,
                height,
                baseX,
                0,
                x,
                y,
                context.getState().colorMap,
            )
        }

        if (deltaY != 0) {
            // Horizontal empty band
            let imageHeight = Math.abs(deltaY)
            let baseY = deltaY > 0 ? height - deltaY : 0
            fillImage(
                engine,
                ctx,
                width,
                width,
                imageHeight,
                0,
                baseY,
                x,
                y,
                context.getState().colorMap,
            )
        }

        lastX = x
        lastY = y
    }

    return {
        setZoom(newZoom: number) {
            context.updateState((state) => (state.zoom = newZoom))
        },
        setEngine(newEngine: Engine) {
            engine = newEngine
        },
        shift(dy, dx) {
            context.updatePosition((position) => {
                position.posT += dy
                position.posS += dx
            })
        },
        init,
        draw,
    }
}
