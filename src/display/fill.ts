import { Engine } from "../engineType"
import { Color } from "../type"

const GREY = { red: 128, green: 128, blue: 128 }

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
  wrapHorizontal = false,
) {
  let imageData = ctx.createImageData(width, height)

  if (!engine) {
    console.error("/!\\ attempt to fill the canvas before the engine has been set.")
    return
  }

  let canvasWidth = ctx.canvas.width

  fillImageData(
    canvasWidth,
    engine,
    imageData,
    width,
    height,
    baseX,
    baseY,
    posX,
    posY,
    colorMap,
    wrapHorizontal,
  )

  ctx.putImageData(imageData, baseX, baseY)
}

export function fillImageData(
  canvasWidth: number,
  engine: Engine,
  imageData: { data: Uint8ClampedArray },
  width: number,
  height: number,
  baseX: number,
  baseY: number,
  posX: number,
  posY: number,
  colorMap: Color[],
  wrapHorizontal = false,
) {
  let x: number
  let y: number
  let line: Uint8Array = new Uint8Array()

  let lastError: unknown[] = []
  let errorCount = 0
  for (let dy = 0; dy < height; dy += 1) {
    y = posY + baseY + dy

    try {
      line = engine.getLine(y)
    } catch (e) {
      let greyIndex = colorMap.findIndex((c) => c === GREY)
      if (greyIndex === -1) {
        console.log(e)
        greyIndex = colorMap.length
        colorMap.push(GREY)
      }
      line = Uint8Array.from({ length: engine.getLineLength() }, () => greyIndex)
    }

    for (let dx = 0; dx < width; dx += 1) {
      x = Math.round(posX + baseX + dx + (line.length - canvasWidth) / 2)
      if (x < 0 || x >= line.length) {
        if (wrapHorizontal) {
          x = ((x % line.length) + line.length) % line.length
        } else {
          continue
        }
      }
      let color = colorMap[line[x]]
      if (!color) {
        lastError = [
          "Encountered a color index [",
          line[x],
          "] at postion [",
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

  if (errorCount) {
    console.error(errorCount, ...lastError)
    console.log("line", line)
    debugger
  }
}
