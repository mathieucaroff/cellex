import { useContext, useLayoutEffect, useRef } from "react"

import { fillImage } from "../../display/fill"
import { createAutomatonEngine } from "../../engine/Engine"
import { createRandomMapper } from "../../engine/RandomMapper"
import { createTableCodeCalculator } from "../../engine/calculator/tableCode"
import { createTableRuleCalculator } from "../../engine/calculator/tableRule"
import { Calculator } from "../../engineType"
import { parseNomenclature } from "../../nomenclature/nomenclature"
import { parseTopBorder } from "../../patternlang/parser"
import { ReactContext } from "../../state/ReactContext"
import { TopologyFinite } from "../../topologyType"
import { useStateSelection } from "../hooks"

export interface AutomatonOverviewProp {
  ruleName: string
  genesis: string
  width: number
  height: number
}

export function AutomatonCanvas(prop: AutomatonOverviewProp) {
  let { context } = useContext(ReactContext)
  let [seedString, colorMap] = useStateSelection((s) => [s.seed, s.colorMap])

  let canvasRef = useRef<HTMLCanvasElement>()

  let rule = parseNomenclature(prop.ruleName)
  let genesis = parseTopBorder(prop.genesis)

  useLayoutEffect(() => {
    let randomMapper = createRandomMapper({ seedString })
    let canvas = canvasRef.current
    canvas.className = "automatonOverview"
    canvas.width = prop.width
    canvas.height = prop.height

    let ctx = canvas.getContext("2d")!
    let topology: TopologyFinite = {
      kind: "loop",
      finitness: "finite",
      genesis,
      width: canvas.width,
    }
    let calculator: Calculator
    if (rule.kind === "tableRule") {
      calculator = createTableRuleCalculator(rule, topology, randomMapper)
    } else if (rule.kind === "tableCode") {
      calculator = createTableCodeCalculator(rule, topology, randomMapper)
    } else {
      throw new Error("unsupported rule kind: " + JSON.stringify(rule))
    }
    let engine = createAutomatonEngine(calculator, topology, randomMapper)

    // draw
    fillImage(engine, ctx, canvas.width, canvas.width, canvas.height, 0, 0, 0, 0, colorMap)
  }, [seedString, JSON.stringify(colorMap)])

  // set the state on click
  const handleClick = () => {
    context.updateState((s) => {
      s.rule = rule
      s.topology.genesis = genesis
      s.posT = 0
      s.posS = 0
      s.galleryIsOpen = false
    })
  }

  return <canvas onClick={handleClick} ref={canvasRef} />
}
