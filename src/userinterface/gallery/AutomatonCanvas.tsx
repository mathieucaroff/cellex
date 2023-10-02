import { useContext, useEffect, useRef } from "react"

import { fillImage } from "../../display/fill"
import { createAutomatonEngine } from "../../engine/Engine"
import { createRandomMapper } from "../../engine/RandomMapper"
import { createConceiver } from "../../engine/conceiver/conceiver"
import { parseNomenclature } from "../../nomenclature/nomenclature"
import { parseTopBorder } from "../../patternlang/parser"
import { ReactContext } from "../../state/ReactContext"
import { TopologyFinite } from "../../topologyType"
import { useStateSelection } from "../hooks"

export interface AutomatonOverviewProp {
  descriptor: string
  genesis: string
  title?: string
  width: number
  height: number
}

export function AutomatonCanvas(prop: AutomatonOverviewProp) {
  let { context } = useContext(ReactContext)
  let [seedString, colorMap] = useStateSelection((s) => [s.seed, s.colorMap])

  let title = prop.title
  if (title == undefined) {
    if (prop.descriptor.length < 30) {
      title = `${prop.descriptor}\n${prop.genesis}`
    } else {
      title = prop.genesis
    }
  }

  let canvasRef = useRef<HTMLCanvasElement>()

  let rule = parseNomenclature(prop.descriptor)
  let genesis = parseTopBorder(prop.genesis)
  let topology: TopologyFinite = {
    kind: "loop",
    finitness: "finite",
    genesis,
    width: prop.width,
  }

  useEffect(() => {
    let randomMapper = createRandomMapper({ seedString })
    let canvas = canvasRef.current

    let calculator = createConceiver(rule, topology, randomMapper)
    let engine = createAutomatonEngine(calculator, topology, randomMapper)

    // draw
    let ctx = canvas.getContext("2d")!
    fillImage(engine, ctx, canvas.width, canvas.height, 0, 0, 0, 0, colorMap)
  }, [seedString, JSON.stringify(colorMap)])

  // set the state on click
  const handleClick = () => {
    context.updateState((s) => {
      s.automaton = rule
      s.topology.genesis = genesis
      s.posT = 0
      s.posS = 0
      s.galleryIsOpen = false
    })
  }

  return (
    <canvas
      className="automatonOverview"
      title={title}
      width={prop.width}
      height={prop.height}
      onClick={handleClick}
      ref={canvasRef}
    />
  )
}
