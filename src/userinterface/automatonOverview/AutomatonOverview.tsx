import { useContext, useLayoutEffect, useRef } from "react"

import { fillImage } from "../../display/fill"
import { createAutomatonEngine } from "../../engine/Engine"
import { createRandomMapper } from "../../engine/RandomMapper"
import { parseNomenclature } from "../../nomenclature/nomenclature"
import { parseTopBorder } from "../../patternlang/parser"
import { ReactContext } from "../../state/ReactContext"
import { useStateSelection } from "../hooks"

export interface AutomatonOverviewProp {
  ruleName: string
  genesis: string
  width: number
  height: number
}

export function AutomatonOverview(prop: AutomatonOverviewProp) {
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
    let engine = createAutomatonEngine(
      rule,
      { kind: "loop", finitness: "finite", genesis, width: canvas.width },
      randomMapper,
    )

    // draw
    fillImage(engine, ctx, canvas.width, canvas.width, canvas.height, 0, 0, 0, 0, colorMap)
  }, [])

  // set the state on click
  const handleClick = () => {
    context.updateState((s) => {
      s.rule = rule
      s.topology.genesis = genesis
    })
  }

  return <canvas onClick={handleClick} ref={canvasRef} />
}
