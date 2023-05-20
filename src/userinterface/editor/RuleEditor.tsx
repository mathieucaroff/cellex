import { Button, Space } from "antd"
import { useContext, useLayoutEffect, useRef } from "react"

import { colorComplement, computeTransitionNumber, leftRightSymmetric } from "../../engine/rule"
import { presentNomenclature } from "../../nomenclature/nomenclature"
import { Rule } from "../../ruleType"
import { ReactContext } from "../../state/ReactContext"
import { deepEqual } from "../../util/deepEqual"
import { mod } from "../../util/mod"
import { addOne, subtractOne } from "../../util/numberArray"
import { RuleInfo } from "../RuleInfo"
import { useStateSelection } from "../hooks"
import { fillRuleEditor } from "./fillRuleEditor"
import {
  getMathworldLink as getMathWorldLink,
  getWikipediaDedicatedPageLink,
  getWikipediaLink,
  getWolframAlphaLink,
} from "./link"

export let RuleEditor = () => {
  let { context } = useContext(ReactContext)
  let { rule, colorMap } = useStateSelection(({ rule, colorMap }) => ({ rule, colorMap }))
  let canvasRef = useRef<HTMLCanvasElement>(null)
  let smallCanvas = document.createElement("canvas")
  let smallCtx = smallCanvas.getContext("2d")!
  // xSpacing and ySpacing define the spacing between the occurences of the function's entries
  const xSpacing = rule.neighborhoodSize + 1
  const ySpacing = 3
  // iWidth and iHeight define how many occurences of entry per row or column
  const iWidth = 8
  const iHeight = Math.ceil(rule.transitionFunction.length / iWidth)

  fillRuleEditor(smallCtx, rule, colorMap, xSpacing, ySpacing, iWidth, iHeight)

  const zoom = Math.min(Math.floor(0.9 * (window.innerWidth / (8 * 4))), 24)
  // useLayoutEffect here because we need to wait for the canvas to be instanciated
  useLayoutEffect(() => {
    let canvas = canvasRef.current!
    if (rule.transitionFunction.length > 32) {
      canvas.height = 0
      return
    }
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

  let changeColor =
    (delta: number, exact: boolean) => (ev: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      ev.preventDefault()
      let { stateCount, transitionFunction } = rule
      let [position, error] = getPosition(ev, exact)
      if (error) {
        return
      }
      context.updateState(() => {
        transitionFunction[position] = mod(transitionFunction[position] + delta, stateCount)
      })
    }

  let complement = colorComplement(rule)
  let symmetric = leftRightSymmetric(rule)
  let both = leftRightSymmetric(complement)

  let identityDifferenceArray: number[] = []
  let identityFunction = rule.transitionFunction.map((v, k) => {
    let n = rule.transitionFunction.length - 1 - k
    let centerPosition = Math.floor(rule.neighborhoodSize / 2)
    let result = Math.floor(n / rule.stateCount ** centerPosition) % rule.stateCount
    if (result !== v) {
      identityDifferenceArray.push(k)
    }
    return result
  })

  let ruleNumber = -1
  let mathWorldLink = ""
  let wikipediaLink = ""
  let wikipediaDedicatedPageLink = ""
  let ulContent: React.ReactNode[] = []
  if (rule.neighborhoodSize === 3 && rule.stateCount === 2) {
    ruleNumber = Number(computeTransitionNumber(rule))
    ;[
      [getMathWorldLink(ruleNumber), "on Wolfram MathWorld"],
      [getWikipediaLink(ruleNumber), "on Wikipedia"],
      [getWikipediaDedicatedPageLink(ruleNumber), "on its dedicated Wikipedia page"],
    ].forEach(([link, pageName]) => {
      if (link) {
        ulContent.push(
          <a href={link} key={pageName}>
            <li>
              {pageName} <i className="fa fa-external-link" />
            </li>
          </a>,
        )
      }
    })
  }

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
          title="Simplify 1 state"
          disabled={identityDifferenceArray.length == 0}
          onClick={() => {
            context.updateState(({ rule }) => {
              let index =
                identityDifferenceArray[Math.floor(Math.random() * identityDifferenceArray.length)]
              rule.transitionFunction[index] = identityFunction[index]
            })
          }}
        >
          Simplify
        </Button>
        <Button
          disabled={rule.stateCount >= 6}
          onClick={() => {
            context.updateState(({ rule }) => {
              let oldLength = rule.transitionFunction.length
              let osc = rule.stateCount // old state count

              rule.stateCount += 1

              let sc = rule.stateCount
              let length = sc ** 3
              let tf = Array.from({ length }, (_, k) => {
                let n = length - 1 - k
                let left = Math.floor(n / sc ** 2)
                let middle = Math.floor(n / sc) % sc
                let right = n % sc
                // if any of left, middle or right too big for the old rule,
                // we should default to the highest acceptable value
                left = Math.min(left, osc - 1)
                middle = Math.min(middle, osc - 1)
                right = Math.min(right, osc - 1)
                let index = left * osc ** 2 + middle * osc + right
                return rule.transitionFunction[oldLength - 1 - index]
              })
              rule.transitionFunction = tf
            })
          }}
        >
          Upgrade state count to {rule.stateCount + 1} ({"__btqph_"[rule.stateCount + 1]})
        </Button>
        <Button
          disabled={deepEqual(rule.transitionFunction, complement.transitionFunction)}
          onClick={() => {
            context.updateState(({ rule }) => {
              rule.transitionFunction = complement.transitionFunction
            })
          }}
        >
          Switch to color complement: {presentNomenclature(complement).descriptor}
        </Button>
        <Button
          disabled={deepEqual(rule.transitionFunction, symmetric.transitionFunction)}
          onClick={() => {
            context.updateState(({ rule }) => {
              rule.transitionFunction = symmetric.transitionFunction
            })
          }}
        >
          Switch to left-right symmetric: {presentNomenclature(symmetric).descriptor}
        </Button>
        <Button
          disabled={deepEqual(rule.transitionFunction, both.transitionFunction)}
          onClick={() => {
            context.updateState(({ rule }) => {
              rule.transitionFunction = both.transitionFunction
            })
          }}
        >
          Switch both: {presentNomenclature(both).descriptor}
        </Button>
      </div>
      <canvas
        className="ruleEditorCanvas"
        style={{ display: "table" }}
        ref={canvasRef}
        onMouseDown={(ev) => changeColor(ev.button === 1 ? 1 : -1, true)(ev)}
      />
      <RuleInfo />
      <ul>
        <a href={getWolframAlphaLink(rule)} target="_blank">
          <li>
            See this rule on WolframAlpha <i className="fa fa-external-link" />
          </li>
        </a>
        {ulContent.length > 0 && (
          <li>
            Also read about rule {ruleNumber}:<ul>{ulContent}</ul>
          </li>
        )}
      </ul>
    </Space>
  )
}
