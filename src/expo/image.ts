import { AlphaType, ColorType, Skia } from "@shopify/react-native-skia"

import { Engine } from "../engineType"
import { Color } from "../type"

const GREY = { red: 128, green: 128, blue: 128 }

/**
 *
 * @param engine The engine to request lines
 * @param canvasWidth The width of the canvas which will display the image
 * @param width The width of the region to draw
 * @param height The height of the region to draw
 * @param baseX The X position where to put the image in the canvas
 * @param baseY The Y position where to put the image in the canvas
 * @param posX The X position in engine coordinates to know what to draw
 * @param posY The Y engine-position to draw
 * @param colorMap The color to give to each engine state
 */
export function createImage(
  engine: Engine,
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

  const pixelData = new Uint8Array(256 * 256 * 4)

  let lastError: unknown[] = []
  let errorCount = 0

  if (!engine) {
    console.error("/!\\ attempt to fill the canvas before the engine has been set.")
    return
  }
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
        pixelData[u] = color.red
        pixelData[u + 1] = color.green
        pixelData[u + 2] = color.blue
        pixelData[u + 3] = 255
      }
    }
  }

  if (errorCount) {
    console.error(errorCount, ...lastError)
    console.log("line", line)
    debugger
  }

  const data = Skia.Data.fromBytes(pixelData)
  const image = Skia.Image.MakeImage(
    {
      width: 256,
      height: 256,
      alphaType: AlphaType.Opaque,
      colorType: ColorType.RGBA_8888,
    },
    data,
    256 * 4,
  )
  return image
}
