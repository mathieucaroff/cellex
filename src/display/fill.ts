import { Engine } from "../engine/Engine"
import { Color } from "../type"

/**
 *
 * @param engine The engine to request lines
 * @param ctx The canvas context, to putImageData on
 * @param canvasWidth The canvas width, to make sense of the posY info
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
  canvasWidth: number,
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

  let error: unknown[] = []
  let errorCount = 0

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
          error = ["Encountered a color absent from colormap", x]
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
    console.error(errorCount, error)
  }

  ctx.putImageData(imageData, baseX, baseY)
}
