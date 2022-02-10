import { Engine } from "../engine/engine"

export let colorMap = [
    { red: 0, green: 0, blue: 0 }, // 0 black
    { red: 0, green: 127, blue: 200 }, // 1 blue
    { red: 127, green: 127, blue: 0 }, // 2 yellow
    { red: 160, green: 0, blue: 0 }, // 3 red
    { red: 0, green: 160, blue: 0 }, // 4 green
    { red: 127, green: 0, blue: 200 }, // 5 majenta
]

export function fillImage(
    engine: Engine,
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    width: number,
    height: number,
    baseX: number,
    baseY: number,
    posX: number,
    posY: number,
    step: number,
) {
    let x: number
    let y: number
    let currentY: number = -1
    let line: Uint8Array
    let imageData = ctx.createImageData(width, height)

    if (!engine) {
        return
    }
    y = baseY
    currentY = baseY
    line = engine.getLine(y)
    for (let k = 0; k < width * height; k += step) {
        y = posY + baseY + Math.floor(k / width)
        x = posX + baseX + Math.floor((line.length - canvasWidth) / 2) + (k % width)
        if (currentY != y) {
            line = engine.getLine(y)
            currentY = y
        }
        if (x >= 0 && x < line.length) {
            let color = colorMap[line[x]]
            imageData.data[4 * k] = color.red
            imageData.data[4 * k + 1] = color.green
            imageData.data[4 * k + 2] = color.blue
            imageData.data[4 * k + 3] = 255
        }
    }

    ctx.putImageData(imageData, baseX, baseY)
}
