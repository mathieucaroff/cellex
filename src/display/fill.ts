import { Engine } from "../engine/Engine"
import { Color } from "../type"

/**
 *
 * @param engine The engine to request lines
 * @param ctx The canvas context, to putImageData on
 * @param width The width of the region to draw
 * @param height The height of the region to draw
 * @param baseX The X position where to put the image in the canvas
 * @param baseY The Y position where to put the image in the canvas
 * @param posX The X position in engine coordinates to know what to draw
 * @param posY The Y engine-position to draw
 * @param colorMap The color to give to each engine state
 */
export function fillImage(
  engine: Engine | undefined,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  baseX: number,
  baseY: number,
  posX: number,
  posY: number,
  colorMap: Color[],
) {
  let x: number
  let y: number
  let line: Uint8Array
  let imageData = ctx.createImageData(width, height)

  let lastError: unknown[] = []
  let errorCount = 0

  if (!engine) {
    console.error("/!\\ attempt to fill the canvas before the engine has been set.")
    return
  }
  for (let dy = 0; dy < height; dy += 1) {
    y = posY + baseY + dy
    line = engine.getLine(y)
    for (let dx = 0; dx < width; dx += 1) {
      x = Math.round(posX + baseX + dx + (line.length - ctx.canvas.width) / 2)
      if (x >= 0 && x < line.length) {
        let color = colorMap[line[x]]
        if (!color) {
          lastError = [
            "Encountered a color index [",
            x,
            "] which is absent from the colormap",
            colorMap,
          ]
          errorCount += 1
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

  if (errorCount) {
    console.error(errorCount, ...lastError)
    console.log("line", line)
    debugger
  }

  ctx.putImageData(imageData, baseX, baseY)
}
