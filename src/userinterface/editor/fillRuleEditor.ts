import { TableRuleAutomaton } from "../../automatonType"
import { Color } from "../../type"

function writeColor(buffer: Uint8ClampedArray, x: number, color: Color) {
  buffer[x] = color.red
  buffer[x + 1] = color.green
  buffer[x + 2] = color.blue
  buffer[x + 3] = 255
}

// fillRuleEditor fill the ruleEditor small canvas from the rule data
export let fillRuleEditor = (
  ctx: CanvasRenderingContext2D,
  rule: TableRuleAutomaton,
  colorMap: Color[],
  xSpacing: number,
  ySpacing: number,
  iWidth: number,
  iHeight: number,
) => {
  const xMiddle = Math.floor(rule.neighborhoodSize / 2)

  // set canvas width and height
  ctx.canvas.width = iWidth * xSpacing
  ctx.canvas.height = iHeight * ySpacing

  let image = ctx.createImageData(ctx.canvas.width, ctx.canvas.height)

  // fill the image
  for (let i = 0; i < rule.transitionTable.length; i++) {
    let iy = Math.floor(i / iWidth)
    let ix = i % iWidth
    let y = iy * ySpacing
    let x = ix * xSpacing
    let p = y * ctx.canvas.width + x
    let q = 4 * p
    let q2 = 4 * (p + ctx.canvas.width + xMiddle)

    let text = (rule.transitionTable.length - 1 - i).toString(rule.stateCount)
    text = text.padStart(rule.neighborhoodSize, "0")
    text.split("").forEach((c, dp) => {
      writeColor(image.data, q + 4 * dp, colorMap[Number.parseInt(c, 16)])
    })

    writeColor(image.data, q2, colorMap[rule.transitionTable[i]])
  }

  ctx.putImageData(image, 0, 0)

  return [iWidth, iHeight]
}
