import { Button, Space } from "antd"
import { useContext, useLayoutEffect, useRef } from "react"

import { colorComplement, computeTransitionNumber, leftRightSymmetric } from "../../engine/rule"
import { presentNomenclature } from "../../nomenclature/nomenclature"
import { ReactContext } from "../../state/ReactContext"
import { deepEqual } from "../../util/deepEqual"
import { mod } from "../../util/mod"
import { randomChoice } from "../../util/randomChoice"
import { RuleInfo } from "../RuleInfo"
import { NumberVariator } from "../components/NumberVariator/NumberVariator"
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
  let { length } = rule.transitionFunction
  let iWidthPeriodicity = rule.stateCount
  if (iWidthPeriodicity <= 2) {
    iWidthPeriodicity = 4
  }
  let minimumIWidth = (iWidthPeriodicity < 6 ? 2 : 1) * iWidthPeriodicity
  // xSpacing and ySpacing define the spacing between the occurences of the function's entries
  const xSpacing = rule.neighborhoodSize + 1
  const ySpacing = 3
  // iWidth and iHeight define how many occurences of entry per row or column
  const iWidth = Math.max(
    minimumIWidth,
    iWidthPeriodicity * Math.floor((8 * length ** 0.5) / (xSpacing * iWidthPeriodicity)),
  )
  const iHeight = Math.ceil(length / iWidth)

  fillRuleEditor(smallCtx, rule, colorMap, xSpacing, ySpacing, iWidth, iHeight)

  const zoom = Math.min(Math.floor(0.9 * (window.innerWidth / smallCanvas.width)), 24)
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
    if (position >= length) {
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
    let n = length - 1 - k
    let centerPosition = Math.floor(rule.neighborhoodSize / 2)
    let result = Math.floor(n / rule.stateCount ** centerPosition) % rule.stateCount
    if (result !== v) {
      identityDifferenceArray.push(k)
    }
    return result
  })

  let ruleNumber = -1
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
          <a href={link} target="_blank" key={pageName}>
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
      <div className="ruleEditor__controlButtonDiv">
        <Button
          title="Simplify 1 step towards identity"
          disabled={identityDifferenceArray.length == 0}
          onClick={() => {
            context.updateState(({ rule }) => {
              let index = randomChoice(identityDifferenceArray)
              rule.transitionFunction[index] = identityFunction[index]
            })
          }}
        >
          Simplify
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
      {length > 512 ? (
        <></>
      ) : (
        <div>
          <NumberVariator
            valueArray={rule.transitionFunction}
            onChange={(array) => {
              context.updateState((state) => {
                let base = rule.stateCount
                for (let k = array.length - 1; k >= 0; k--) {
                  let quotient: number
                  if (array[k] >= 0) {
                    quotient = Math.floor(array[k] / base)
                  } else {
                    quotient = -Math.floor((base - array[k]) / base)
                  }
                  array[k] -= quotient * base
                  if (k > 0) {
                    // apply the carry
                    array[k - 1] += quotient
                  }
                }
                if (array.some((v) => isNaN(v))) {
                  return
                }

                state.rule.transitionFunction = array
              })
            }}
            titleIncreaseFunction={(k) => `+ ${rule.stateCount ** k}`}
            titleDecreaseFunction={(k) => `- ${rule.stateCount ** k}`}
          />
        </div>
      )}
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
