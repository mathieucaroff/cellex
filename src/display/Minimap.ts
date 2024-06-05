import { Context } from "../state/Context"

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
  minimap.appendChild(highlight)
  rootElement.appendChild(minimap)

  context
    .use(({ displayMinimap }) => displayMinimap)
    .for((displayMinimap) => {
      minimap.style.display = displayMinimap ? "block" : "none"
    })

  context.usePosition((pos, st) => {
    let minimapWidth = 0.1 * st.canvasSize.width
    let minimapHeight = 0.5 * st.canvasSize.height
    highlight.style.left =
      (0.5 + (pos.posS - st.canvasSize.width / st.zoom / 2) / st.topology.width) * 100 + "%"
    highlight.style.top = (pos.posT / 2000) * 100 + "%"
    highlight.style.width = (st.canvasSize.width / (st.topology.width * st.zoom)) * 100 + "%"
    highlight.style.height =
      (((st.canvasSize.height / (st.topology.width * st.zoom)) * minimapWidth) / minimapHeight) *
        100 +
      "%"
  })

  const getEventX = (ev: MouseEvent) => 10 * ev.clientX
  const getEventY = (ev: MouseEvent) => 5.75 * ev.clientY

  let isMouseDown = false
  let startPosition = { x: 0, y: 0 }
  highlight.addEventListener("mousedown", (ev) => {
    isMouseDown = true
    ev.preventDefault()
    ev.stopImmediatePropagation()
    startPosition = {
      x: getEventX(ev) - context.getState().posS,
      y: getEventY(ev) - context.getState().posT,
    }
  })
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
