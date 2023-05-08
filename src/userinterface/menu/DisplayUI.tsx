import { Button, Checkbox, Divider } from "antd"
import { useContext, useState } from "react"

import { ReactContext } from "../../state/ReactContext"
import { OxButton, OxInputNumber } from "../component"

export let DisplayUI = () => {
  let { act, context } = useContext(ReactContext)

  return (
    <ul>
      <li>
        Speed: <Button icon={"/2"} onClick={() => act.halfSpeed()} />
        <Button icon={"-"} onClick={() => act.decreaseSpeed()} />
        <OxInputNumber path="speed" />
        <Button icon={"+"} onClick={() => act.increaseSpeed()} />
        <Button icon={"x2"} onClick={() => act.doubleSpeed()} />
      </li>
      <li>
        🔎 Zoom: <Button icon={"/2"} onClick={() => act.halfZoom()} />
        <Button icon={"-"} onClick={() => act.decreaseZoom()} />
        <OxInputNumber path="zoom" />
        <Button icon={"+"} onClick={() => act.increaseZoom()} />
        <Button icon={"x2"} onClick={() => act.doubleZoom()} />
      </li>
      <li>
        ⌖Space position: <OxInputNumber path="posS" />
      </li>
      <li>
        ⌖Time position (generation): <OxInputNumber path="posT" />
        <Button onClick={() => act.gotoTop()}>Reset</Button>
      </li>
      <li>
        ⟷Canvas width: <OxButton half icon={"/2"} path="canvasSize.width" />
        <OxInputNumber path="canvasSize.width" />
        <OxButton double icon={"x2"} path="canvasSize.width" />
        <br />
        <Button
          onClick={context.action((state) => {
            state.canvasSize.width = state.topology.width
          })}
        >
          Copy simulation width
        </Button>
        <Button
          onClick={context.action((state) => {
            state.topology.width = state.canvasSize.width
            act.fixPosition(state)
            state.redraw = true
          })}
        >
          Write width to simulation
        </Button>
      </li>
      <li>
        ⭥Canvas height: <OxButton half icon={"/2"} path="canvasSize.height" />
        <OxInputNumber path="canvasSize.height" />
        <OxButton double icon={"x2"} path="canvasSize.height" />
      </li>
    </ul>
  )
}
