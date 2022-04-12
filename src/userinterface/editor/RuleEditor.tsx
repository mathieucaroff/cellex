import { Button, Space } from "antd"
import { useContext, useLayoutEffect, useRef } from "react"
import { colorComplement, leftRightSymmetric, ruleName } from "../../engine/rule"
import { ReactContext } from "../../state/ReactContext"
import { deepEqual } from "../../util/deepEqual"
import { mod } from "../../util/mod"
import { addOne, subtractOne } from "../../util/numberArray"
import { setQueryString } from "../../util/setQueryString"
import { fillRuleEditor } from "./fillRuleEditor"

export let RuleEditor = () => {
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

    const zoom = Math.min(Math.floor(0.9 * (window.innerWidth / (8 * 4))), 24)
    // useLayoutEffect here because we need to wait for the canvas to be instanciated
    useLayoutEffect(() => {
        let canvas = canvasRef.current!
        canvas.width = smallCanvas.width * zoom
        canvas.height = smallCanvas.height * zoom
        let ctx = canvas.getContext("2d")!
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
        if (position >= rule.transitionFunction.length) {
            return [position, "clicking out of range"]
        }
        return [position, ""]
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

    let complement = colorComplement(rule)
    let symmetric = leftRightSymmetric(rule)
    let both = leftRightSymmetric(complement)

    return (
        <Space direction="vertical">
            <div>
                <Button
                    onClick={context.action((state) => {
                        subtractOne(state.rule.transitionFunction, state.rule.stateCount)
                    })}
                >
                    -1
                </Button>
                <Button
                    onClick={context.action((state) => {
                        addOne(state.rule.transitionFunction, state.rule.stateCount)
                    })}
                >
                    +1
                </Button>
                <Button
                    disabled={deepEqual(rule.transitionFunction, complement.transitionFunction)}
                    onClick={() => {
                        context.updateState(({ rule }) => {
                            rule.transitionFunction = complement.transitionFunction
                        })
                    }}
                >
                    Switch to color complement: {ruleName(complement)}
                </Button>
                <Button
                    disabled={deepEqual(rule.transitionFunction, symmetric.transitionFunction)}
                    onClick={() => {
                        context.updateState(({ rule }) => {
                            rule.transitionFunction = symmetric.transitionFunction
                        })
                    }}
                >
                    Switch to left-right symmetric: {ruleName(symmetric)}
                </Button>
                <Button
                    disabled={deepEqual(rule.transitionFunction, both.transitionFunction)}
                    onClick={() => {
                        context.updateState(({ rule }) => {
                            rule.transitionFunction = both.transitionFunction
                        })
                    }}
                >
                    Switch both: {ruleName(both)}
                </Button>
            </div>
            <canvas
                className="ruleEditorCanvas"
                style={{ display: "table" }}
                ref={canvasRef}
                onClick={changeColor(1, false)}
                onWheel={(ev) => changeColor(ev.deltaY > 0 ? 1 : -1, true)(ev)}
            />
        </Space>
    )
}
