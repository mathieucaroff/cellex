import { TableCodeAutomaton, TableRuleAutomaton } from "../../automatonType"
import { Color } from "../../type"

function writeColor(buffer: Uint8ClampedArray, x: number, color: Color) {
  buffer[x] = color.red
  buffer[x + 1] = color.green
  buffer[x + 2] = color.blue
  buffer[x + 3] = 255
}

// fillAutomatonEditor fill the automatonEditor small canvas from the rule data
export let fillAutomatonEditor = (
  ctx: CanvasRenderingContext2D,
  automaton: TableRuleAutomaton | TableCodeAutomaton,
  colorMap: Color[],
  xSpacing: number,
  ySpacing: number,
  iWidth: number,
  iHeight: number,
) => {
  const xMiddle = Math.floor(automaton.neighborhoodSize / 2)

  // set canvas width and height
  ctx.canvas.width = iWidth * xSpacing
  ctx.canvas.height = iHeight * ySpacing

  let image = ctx.createImageData(ctx.canvas.width, ctx.canvas.height)

  // fill the image
  for (let i = 0; i < automaton.transitionTable.length; i++) {
    let iy = Math.floor(i / iWidth)
    let ix = i % iWidth
    let y = iy * ySpacing
    let x = ix * xSpacing
    let p = y * ctx.canvas.width + x
    let q = 4 * p
    let q2 = 4 * (p + ctx.canvas.width + xMiddle)

    let j = automaton.transitionTable.length - 1 - i
    let text = ""
    if (automaton.kind === "tableRule") {
      text = j.toString(automaton.stateCount)
      text = text.padStart(automaton.neighborhoodSize, "0")
      text.split("").forEach((c, dp) => {
        writeColor(image.data, q + 4 * dp, colorMap[Number.parseInt(c, automaton.stateCount)])
      })
    } else {
      let nextCount = j % automaton.neighborhoodSize
      let baseCount = automaton.neighborhoodSize - nextCount
      let baseColorIndex = Math.floor(j / automaton.neighborhoodSize)

      let threshold = baseCount
      for (let dp = 0; dp < automaton.neighborhoodSize; dp++) {
        const color = dp < threshold ? colorMap[baseColorIndex] : colorMap[baseColorIndex + 1]
        writeColor(image.data, q + 4 * dp, color)
      }
    }
    text = text.slice(0, automaton.neighborhoodSize)

    writeColor(image.data, q2, colorMap[automaton.transitionTable[i]])
  }

  ctx.putImageData(image, 0, 0)

  return [iWidth, iHeight]
}
