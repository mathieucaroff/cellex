import { useContext, useLayoutEffect, useRef } from "react"
import { ReactContext } from "../state/reactcontext"
import { fillRuleEditor } from "./fillruleeditor"

export interface RuleEditorProp {}

export let RuleEditor = (prop: RuleEditorProp) => {
    let { context } = useContext(ReactContext)
    let { rule, colorMap } = context.getState()
    let canvasRef = useRef<HTMLCanvasElement>(null)
    let smallCanvas = document.createElement("canvas")
    let smallCtx = smallCanvas.getContext("2d")!
    fillRuleEditor(smallCtx, rule, colorMap)

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

    return <canvas ref={canvasRef} />
}
