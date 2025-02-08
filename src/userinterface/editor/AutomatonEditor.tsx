import { Button, Space } from "antd"
import { useContext, useLayoutEffect, useRef } from "react"

import { TableAutomaton, TableRuleAutomaton } from "../../automatonType"
import {
  baseComplement,
  baseDigitOrderReverse,
  colorComplement,
  computeTransitionNumber,
  leftRightSymmetric,
} from "../../engine/curatedAutomata"
import { isPowerOfTwo } from "../../engine/domain"
import { presentAutomaton } from "../../nomenclature/nomenclature"
import { ReactContext } from "../../state/ReactContext"
import { log } from "../../util/console"
import { deepEqual } from "../../util/deepEqual"
import { mod } from "../../util/mod"
import { normalizeArray } from "../../util/normalizeArray"
import { randomChoice } from "../../util/randomChoice"
import { numberToStringWithThousandSplit } from "../../util/thousandSplit"
import { RuleInfo } from "../RuleInfo"
import { NumberVariator } from "../components/NumberVariator/NumberVariator"
import { useStateSelection } from "../hooks"
import { DomainChangeButton } from "./DomainChangeButton"
import "./automatonEditor.css"
import { fillAutomatonEditor } from "./fillAutomatonEditor"
import {
  getMathWorldLink,
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
    let [position, error] = getPosition(ev, exact)
    if (error) {
      return
    }
    context.updateState((state) => {
      let { stateCount, transitionTable } = state.automaton
      transitionTable[position] = mod(transitionTable[position] + delta, stateCount)
    })
  }

  let complement: TableAutomaton
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

  let lengthLimit = 25

  return (
    <Space direction="vertical">
      <div className="automatonEditor__controlButtonDiv">
        <div>
          {automaton.kind === "tableRule" && (
            <Button
              title="Simplify 1 step towards identity"
              disabled={identityDifferenceArray.length === 0}
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
          <DomainChangeButton
            automaton={automaton}
            delta={{ ns: +2 }}
            derive={(old, { cc, ns, kind, length }) => {
              if (kind === "tableRule") {
                // To increase the neighborhood size, the strategy is to ignore the left and right ends
                // of the new neighborhood so as to get a thinner head so as to be able to lookup the value
                // in the old table.
                let table = Array.from({ length }, (_, k) => {
                  let head = k.toString(cc).padStart(ns, "0").slice(1, -1)
                  let narrowerK = parseInt(head, cc)
                  return old[narrowerK] ?? log(`bad k (increasing ns)`, narrowerK, old.length, old)
                })
                return table
              } else {
                // For codes, set the color to 0 for all totals which exceed the previous table length
                return Array.from({ length: length - old.length }, () => 0).concat(old)
              }
            }}
            label={({ ns }) => `⟷ Increase neighborhood size to ${ns}`}
          />
          <DomainChangeButton
            automaton={automaton}
            delta={{ ns: -2 }}
            derive={(old, { cc, kind, length }) => {
              if (kind === "tableRule") {
                // To decrease the neighborhood size, the strategy is to read the results from the old
                // table, where the two neighborhood ends are dead cells (black cells)
                let table = Array.from({ length }, (_, k) => {
                  return old[k * cc] ?? log(`bad k (decreasing ns)`, k * cc, length, old)
                })
                return table
              } else {
                // For codes we just discard the part whose totals are no longer reachable
                return old.slice(old.length - length)
              }
            }}
            label={({ ns }) => `⟷ Decrease neighborhood size to ${ns}`}
          />
          <DomainChangeButton
            automaton={automaton}
            delta={{ cc: +1 }}
            derive={(old, { cc, kind, length }) => {
              if (kind === "tableRule") {
                // To increase the color count, the strategy we adopt is to use the
                // exising color result for any pre-existing head color pattern. For
                // new head color patterns, we replace the new color by the closest
                // color (which turns out to be the color one below). Doing so yields
                // an existing head color pattern all the time.
                let table = Array.from({ length }, (_, k) => {
                  let head = (length - 1 - k).toString(cc)
                  // If we had any of the new colors (`cc-1`) in the head, we replace them
                  // by the largest color that already existed before
                  head = head.replaceAll(`${cc - 1}`, `${cc - 2}`)
                  // The head value can then be converted back to integer using the "old state count"
                  let hypoColoredK = old.length - 1 - parseInt(head, cc - 1)
                  // We can then perform the lookup in the old table to find the resulting color value
                  return (
                    old[hypoColoredK] ?? log(`bad k (increasing color)`, k * cc, old.length, old)
                  )
                })
                return table
              } else {
                // For codes, we only know the total of the content of the neighborhood.
                // To increase the color count, for all the totals greater than what was
                // previously possible, we set the color to 0:
                return Array.from({ length: length - old.length }, () => 0).concat(old)
              }
            }}
            label={({ cc }) => `🎨 Increase color count to ${cc}`}
          />
          <DomainChangeButton
            automaton={automaton}
            delta={{ cc: -1 }}
            derive={(old, { cc, kind, length }) => {
              if (kind === "tableRule") {
                // To decrease the color count, we just keep the existing associations and ignore the rest
                let table = Array.from({ length }, (_, k) => {
                  let head = (length - 1 - k).toString(cc)
                  let hyperColoredK = old.length - 1 - parseInt(head, cc + 1)
                  let color =
                    old[hyperColoredK] ?? log(`bad k (decreasing color)`, k * cc, old.length, old)
                  return color >= cc ? color - 1 : color
                })
                return table
              } else {
                // For codes, we do:
                // - discard the part of the code that has become unreachable
                // - results which give the color that is being removed are
                //   replaced by the closest color: the one just below it
                return old
                  .slice(old.length - length)
                  .map((color) => (color >= cc ? color - 1 : color))
              }
            }}
            label={({ cc }) => `🎨 Decrease color count to ${cc}`}
          />
        </div>
        <div>
          <Button
            disabled={deepEqual(automaton.transitionTable, complement.transitionTable)}
            onClick={() => {
              context.updateState(({ automaton }) => {
                automaton.transitionTable = complement.transitionTable
              })
            }}
          >
            🎨 Switch to color complement:{" "}
            {presentAutomaton(complement, { lengthLimit }).descriptor}
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
              ⟷ Switch to left-right symmetric:{" "}
              {presentAutomaton(symmetric, { lengthLimit }).descriptor}
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
              🎨⟷ Switch both: {presentAutomaton(both, { lengthLimit }).descriptor}
            </Button>
          )}
        </div>
        <div>
          <Button
            disabled={!isPowerOfTwo(automaton.stateCount)}
            onClick={() => {
              context.updateState(({ automaton }) => {
                automaton.reversible = !automaton.reversible
              })
            }}
          >
            ⭥ Toggle reversibility
          </Button>
          {baseXComplement && (
            <Button
              disabled={deepEqual(automaton.transitionTable, baseXComplement.transitionTable)}
              onClick={() => {
                context.updateState(({ automaton }) => {
                  automaton.transitionTable = baseXComplement.transitionTable
                })
              }}
            >
              ✨ Toggle twinkliness: {presentAutomaton(baseXComplement, { lengthLimit }).descriptor}
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
              # Switch to base ({automaton.stateCount}) digit order reverse:{" "}
              {presentAutomaton(baseXReverse, { lengthLimit }).descriptor}
            </Button>
          )}
        </div>
      </div>
      <NumberVariator
        valueArray={automaton.transitionTable}
        onChange={(array) => {
          context.updateState((state) => {
            let base = automaton.stateCount
            normalizeArray(array, base)
            state.automaton.transitionTable = array
          })
        }}
        defaultOpen={length <= 512}
        titleVariationFunction={(k) => numberToStringWithThousandSplit(automaton.stateCount ** k)}
      />
      <canvas
        className="automatonEditorCanvas"
        style={{ display: "table" }}
        ref={canvasRef}
        onMouseDown={clickChangeColor}
      />
      <RuleInfo />
      <ul>
        {!automaton.reversible && (
          <a href={getWolframAlphaLink(automaton)} target="_blank">
            <li>
              See this rule on WolframAlpha <i className="fa fa-external-link" />
            </li>
          </a>
        )}
        {ulContent.length > 0 && (
          <li>
            Also read about rule {ruleNumber}:<ul>{ulContent}</ul>
          </li>
        )}
      </ul>
    </Space>
  )
}
