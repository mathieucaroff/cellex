import { Context } from "../state/Context"
import "./minimap.css"

export interface MinimapProp {
  rootElement: HTMLElement
  context: Context
}

export function createMinimap(prop: MinimapProp) {
  let { rootElement, context } = prop
  let minimap = document.createElement("div")
  minimap.className = "minimap"
  let highlight = document.createElement("div")
  highlight.className = "minimapHighlight"
  let highlight2 = document.createElement("div")
  highlight2.className = "minimapHighlight"
  minimap.appendChild(highlight)
  minimap.appendChild(highlight2)
  rootElement.appendChild(minimap)

  context
    .use(({ displayMinimap }) => displayMinimap)
    .for((displayMinimap) => {
      minimap.style.display = displayMinimap ? "block" : "none"
    })

  context.usePosition((pos, st) => {
    let minimapWidth = 0.1 * st.canvasSize.width
    let minimapHeight = 0.5 * st.canvasSize.height
    let s = highlight.style
    let s2 = highlight2.style
    let left = 0.5 + (pos.posS - st.canvasSize.width / st.zoom / 2) / st.topology.width
    let width = st.canvasSize.width / (st.topology.width * st.zoom)
    let height =
      ((st.canvasSize.height / (st.topology.width * st.zoom)) * minimapWidth) / minimapHeight
    s.top = s2.top = (pos.posT / 3850) * 100 + "%"
    s.width = s2.width = width * 100 + "%"
    s.height = s2.height = height * 100 + "%"

    if (width <= 1) {
      s.left = left * 100 + "%"
      s2.display = "block"
      s2.left = (left + (left < 0 ? 1 : -1)) * 100 + "%"
    } else {
      s.left = (-(width - 1) / 2) * 100 + "%"
      s2.display = "none"
      s2.left = "0"
    }
  })

  const getEventX = (ev: MouseEvent) => 10 * ev.clientX
  const getEventY = (ev: MouseEvent) => 5.75 * ev.clientY

  let isMouseDown = false
  let startPosition = { x: 0, y: 0 }
  let handleMouseDown = (ev) => {
    isMouseDown = true
    ev.preventDefault()
    ev.stopImmediatePropagation()
    startPosition = {
      x: getEventX(ev) - context.getState().posS,
      y: getEventY(ev) - context.getState().posT,
    }
  }
  highlight.addEventListener("mousedown", handleMouseDown)
  window.addEventListener("mouseup", () => {
    isMouseDown = false
  })
  window.addEventListener("mousemove", (ev) => {
    if (!isMouseDown) return
    ev.preventDefault()
    ev.stopImmediatePropagation()
    context.updatePosition((_pos, _st, ssw) => {
      ssw.setPosS(getEventX(ev) - startPosition.x)
      ssw.setPosT(getEventY(ev) - startPosition.y)
    })
  })
}
