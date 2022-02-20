import { useContext, useLayoutEffect, useRef } from "react"
import { ruleName } from "../engine/rule"
import { ReactContext } from "../state/reactcontext"
import { setQueryString } from "../util/setQueryString"
import { fillRuleEditor } from "./fillruleeditor"

export interface RuleEditorProp {}

export let RuleEditor = (prop: RuleEditorProp) => {
    let { context } = useContext(ReactContext)
    let { rule, colorMap } = context.getState()
    let canvasRef = useRef<HTMLCanvasElement>(null)
    let smallCanvas = document.createElement("canvas")
    let smallCtx = smallCanvas.getContext("2d")!
    // xSpacing, ySpacing tell the spacing between the occurences of the function's entries
    const xSpacing = rule.neighborhoodSize + 1
    const ySpacing = 3
    // iWidth, iHeight tell how many occurences of entry per row or column
    const iWidth = 8
    const iHeight = Math.ceil(rule.transitionFunction.length / iWidth)

    fillRuleEditor(smallCtx, rule, colorMap, xSpacing, ySpacing, iWidth, iHeight)

    const zoom = 20
    useLayoutEffect(() => {
        let canvas = canvasRef.current!
        canvas.width = smallCanvas.width * zoom
        canvas.height = smallCanvas.height * zoom
        let ctx = canvas.getContext("2d")!
        // ctx.clearRect(0, 0, canvas.width, canvas.height) // (seems useless)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(
            smallCanvas,
            0,
            0,
            smallCanvas.width,
            smallCanvas.height,
            0,
            0,
            canvas.width,
            canvas.height,
        )
    })

    let stateCountArray = Array.from({ length: 5 }, (_, k) => `${k + 2}`)

    let getPosition = (ev: any) => {
        let bounds = ev.target.getBoundingClientRect()
        let x = ev.clientX - bounds.left
        let y = ev.clientY - bounds.top
        let ix = Math.floor(x / zoom / xSpacing)
        let iy = Math.floor(y / zoom / ySpacing)
        let position = iy * iWidth + ix
        return position
    }

    return (
        <canvas
            ref={canvasRef}
            onClick={(ev) => {
                context.updateState((state) => {
                    let { stateCount, transitionFunction } = state.rule
                    let position = getPosition(ev)
                    transitionFunction[position] = (transitionFunction[position] + 1) % stateCount
                    setQueryString(window, "rule", ruleName(rule))
                })
            }}
            onScroll={(ev) => {}}
        />
    )
}
