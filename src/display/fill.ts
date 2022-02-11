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
) {
    let x: number
    let y: number
    let line: Uint8Array
    let imageData = ctx.createImageData(width, height)

    if (!engine) {
        return
    }
    for (let dy = 0; dy < height; dy += 1) {
        y = posY + baseY + dy
        line = engine.getLine(y)
        for (let dx = 0; dx < width; dx += 1) {
            x = Math.round(posX + baseX + dx + (line.length - canvasWidth) / 2)
            if (x >= 0 && x < line.length) {
                let color = colorMap[line[x]]
                if (!color) {
                    console.error(x, line[x])
                    continue
                }
                let u = 4 * (dy * width + dx)
                imageData.data[u] = color.red
                imageData.data[u + 1] = color.green
                imageData.data[u + 2] = color.blue
                imageData.data[u + 3] = 255
            }
        }
    }

    ctx.putImageData(imageData, baseX, baseY)
}
