import { Button, Space } from "antd"
import { useContext, useLayoutEffect, useRef } from "react"

import { TableCodeAutomaton, TableRuleAutomaton } from "../../automatonType"
import {
  baseComplement,
  baseDigitOrderReverse,
  colorComplement,
  computeTransitionNumber,
  leftRightSymmetric,
} from "../../engine/curatedAutomata"
import { presentNomenclature } from "../../nomenclature/nomenclature"
import { ReactContext } from "../../state/ReactContext"
import { deepEqual } from "../../util/deepEqual"
import { mod } from "../../util/mod"
import { randomChoice } from "../../util/randomChoice"
import { numberToStringWithThousandSplit } from "../../util/thousandSplit"
import { RuleInfo } from "../RuleInfo"
import { NumberVariator } from "../components/NumberVariator/NumberVariator"
import { useStateSelection } from "../hooks"
import "./automatonEditor.css"
import { fillAutomatonEditor } from "./fillAutomatonEditor"
import {
  getMathworldLink as getMathWorldLink,
  getWikipediaDedicatedPageLink,
  getWikipediaLink,
  getWolframAlphaLink,
} from "./link"

export let AutomatonEditor = () => {
  let { context } = useContext(ReactContext)
  let { automaton, colorMap } = useStateSelection(({ automaton, colorMap }) => ({
    automaton,
    colorMap,
  }))
  if (automaton.kind !== "tableRule" && automaton.kind !== "tableCode") {
    return <></>
  }
  let canvasRef = useRef<HTMLCanvasElement>(null)
  let smallCanvas = document.createElement("canvas")
  let smallCtx = smallCanvas.getContext("2d")!
  let { length } = automaton.transitionTable
  let iWidthPeriodicity = automaton.stateCount
  if (iWidthPeriodicity <= 2) {
    iWidthPeriodicity = 4
  }
  let minimumIWidth = (iWidthPeriodicity < 6 ? 2 : 1) * iWidthPeriodicity
  // xSpacing and ySpacing define the spacing between the occurences of the function's entries
  const xSpacing = automaton.neighborhoodSize + 1
  const ySpacing = 3
  // iWidth and iHeight define how many occurences of entry per row or column
  const iWidth = Math.max(
    minimumIWidth,
    iWidthPeriodicity * Math.floor((8 * length ** 0.5) / (xSpacing * iWidthPeriodicity)),
  )
  const iHeight = Math.ceil(length / iWidth)

  fillAutomatonEditor(smallCtx, automaton, colorMap, xSpacing, ySpacing, iWidth, iHeight)

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
      if (x % (automaton.neighborhoodSize + 1) !== Math.floor(automaton.neighborhoodSize / 2)) {
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

  let clickChangeColor = (ev: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
    let delta = ev.button === 0 ? 1 : -1
    let exact = true
    ev.preventDefault()
    let { stateCount, transitionTable } = automaton
    let [position, error] = getPosition(ev, exact)
    if (error) {
      return
    }
    context.updateState(() => {
      transitionTable[position] = mod(transitionTable[position] + delta, stateCount)
    })
  }

  let complement: TableRuleAutomaton | TableCodeAutomaton
  let symmetric: TableRuleAutomaton | undefined
  let both: TableRuleAutomaton | undefined
  let baseXComplement: TableRuleAutomaton | undefined
  let baseXReverse: TableRuleAutomaton | undefined

  if (automaton.kind === "tableRule") {
    complement = colorComplement(automaton)
    symmetric = leftRightSymmetric(automaton)
    both = leftRightSymmetric(complement)
    baseXComplement = baseComplement(automaton)
    baseXReverse = baseDigitOrderReverse(automaton)
  } else {
    complement = colorComplement(automaton)
  }

  let identityDifferenceArray: number[] = []
  let identityFunction = automaton.transitionTable.map((v, k) => {
    let n = length - 1 - k
    let centerPosition = Math.floor(automaton.neighborhoodSize / 2)
    let result = Math.floor(n / automaton.stateCount ** centerPosition) % automaton.stateCount
    if (result !== v) {
      identityDifferenceArray.push(k)
    }
    return result
  })

  let ruleNumber = -1
  let ulContent: React.ReactNode[] = []
  if (automaton.neighborhoodSize === 3 && automaton.stateCount === 2) {
    ruleNumber = Number(computeTransitionNumber(automaton))
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
      <div className="automatonEditor__controlButtonDiv">
        {automaton.kind === "tableRule" && (
          <Button
            title="Simplify 1 step towards identity"
            disabled={identityDifferenceArray.length == 0}
            onClick={() => {
              context.updateState(({ automaton }) => {
                let index = randomChoice(identityDifferenceArray)
                automaton.transitionTable[index] = identityFunction[index]
              })
            }}
          >
            Simplify
          </Button>
        )}
        <Button
          disabled={deepEqual(automaton.transitionTable, complement.transitionTable)}
          onClick={() => {
            context.updateState(({ automaton }) => {
              automaton.transitionTable = complement.transitionTable
            })
          }}
        >
          Switch to color complement: {presentNomenclature(complement).descriptor}
        </Button>
        {symmetric && (
          <Button
            disabled={deepEqual(automaton.transitionTable, symmetric.transitionTable)}
            onClick={() => {
              context.updateState(({ automaton }) => {
                automaton.transitionTable = symmetric.transitionTable
              })
            }}
          >
            Switch to left-right symmetric: {presentNomenclature(symmetric).descriptor}
          </Button>
        )}
        {both && (
          <Button
            disabled={deepEqual(automaton.transitionTable, both.transitionTable)}
            onClick={() => {
              context.updateState(({ automaton }) => {
                automaton.transitionTable = both.transitionTable
              })
            }}
          >
            Switch both: {presentNomenclature(both).descriptor}
          </Button>
        )}
        {baseXComplement && (
          <Button
            disabled={deepEqual(automaton.transitionTable, baseXComplement.transitionTable)}
            onClick={() => {
              context.updateState(({ automaton }) => {
                automaton.transitionTable = baseXComplement.transitionTable
              })
            }}
          >
            Toggle twinkliness: {presentNomenclature(baseXComplement).descriptor}
          </Button>
        )}
        {baseXReverse && (
          <Button
            disabled={deepEqual(automaton.transitionTable, baseXReverse.transitionTable)}
            onClick={() => {
              context.updateState(({ automaton }) => {
                automaton.transitionTable = baseXReverse.transitionTable
              })
            }}
          >
            Switch to base ({automaton.stateCount}) digit order reverse:{" "}
            {presentNomenclature(baseXReverse).descriptor}
          </Button>
        )}
      </div>
      {length > 512 ? (
        <></>
      ) : (
        <div>
          <NumberVariator
            valueArray={automaton.transitionTable}
            onChange={(array) => {
              context.updateState((state) => {
                let base = automaton.stateCount
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

                state.automaton.transitionTable = array
              })
            }}
            titleIncreaseFunction={(k) =>
              `+ ${numberToStringWithThousandSplit(automaton.stateCount ** k)}`
            }
            titleDecreaseFunction={(k) =>
              `- ${numberToStringWithThousandSplit(automaton.stateCount ** k)}`
            }
          />
        </div>
      )}
      <canvas
        className="automatonEditorCanvas"
        style={{ display: "table" }}
        ref={canvasRef}
        onMouseDown={clickChangeColor}
      />
      <RuleInfo />
      <ul>
        <a href={getWolframAlphaLink(automaton)} target="_blank">
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
