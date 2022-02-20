import { Button, Divider, Space } from "antd"
import { useContext, useLayoutEffect, useRef } from "react"
import { ruleName } from "../engine/rule"
import { ReactContext } from "../state/reactcontext"
import { deepEqual } from "../util/deepEqual"
import { mod } from "../util/mod"
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

    let getPosition = (ev: any, exact: boolean): [number, string] => {
        let bound = ev.target.getBoundingClientRect()
        let mouseX = ev.clientX - bound.left
        let mouseY = ev.clientY - bound.top
        if (exact) {
            let x = Math.floor(mouseX / zoom)
            let y = Math.floor(mouseY / zoom)
            if (x % (rule.neighborhoodSize + 1) !== Math.floor(rule.neighborhoodSize / 2)) {
                return [0, "inexact x coordinate"]
            } else if (y % 3 != 1) {
                return [0, "inexact y coordinate"]
            }
        }
        let ix = Math.floor(mouseX / zoom / xSpacing)
        let iy = Math.floor(mouseY / zoom / ySpacing)
        let position = iy * iWidth + ix
        return [position, ""]
    }

    let leftRightSymmetric = (transitionFunction: number[]): number[] => {
        return transitionFunction.map((_, k) => {
            let text = k.toString(rule.stateCount).padStart(rule.neighborhoodSize, "0")
            return transitionFunction[parseInt(text.split("").reverse().join(""), rule.stateCount)]
        })
    }

    let colorComplement = (transitionFunction: number[]): number[] => {
        return transitionFunction.map((c) => rule.stateCount - 1 - c).reverse()
    }

    let ruleNameWith = (f: (tf: number[]) => number[]) => {
        return ruleName({
            stateCount: rule.stateCount,
            neighborhoodSize: rule.neighborhoodSize,
            transitionFunction: f(rule.transitionFunction),
        })
    }

    let changeColor = (delta, exact) => (ev) => {
        let { stateCount, transitionFunction } = rule
        let [position, error] = getPosition(ev, exact)
        if (error) {
            return
        }
        context.updateState((state) => {
            transitionFunction[position] = mod(transitionFunction[position] + delta, stateCount)
            setQueryString(window, "rule", ruleName(rule))
        })
    }

    return (
        <div>
            <canvas
                style={{ display: "table" }}
                ref={canvasRef}
                onClick={changeColor(1, false)}
                onWheel={(ev) => changeColor(ev.deltaY > 0 ? 1 : -1, true)(ev)}
            />
            <Button
                disabled={deepEqual(
                    rule.transitionFunction,
                    colorComplement(rule.transitionFunction),
                )}
                onClick={() => {
                    context.updateState(({ rule }) => {
                        rule.transitionFunction = colorComplement(rule.transitionFunction)
                    })
                }}
            >
                Switch to color complement: {ruleNameWith(colorComplement)}
            </Button>
            <Button
                disabled={deepEqual(
                    rule.transitionFunction,
                    leftRightSymmetric(rule.transitionFunction),
                )}
                onClick={() => {
                    context.updateState(({ rule }) => {
                        rule.transitionFunction = leftRightSymmetric(rule.transitionFunction)
                    })
                }}
            >
                Switch to left-right symmetric: {ruleNameWith(leftRightSymmetric)}
            </Button>
        </div>
    )
}
