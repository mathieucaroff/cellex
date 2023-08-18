import { Button, InputNumber } from "antd"
import { useContext, useEffect, useState } from "react"

import { ReactContext } from "../../state/ReactContext"
import { OxButton, OxInputNumber } from "../component"

export function DisplayUI() {
  let { act } = useContext(ReactContext)

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
        ⌖Time position (generation): <TimePositionInputNumber />
        <Button onClick={() => act.gotoTop()}>Reset</Button>
      </li>
      <li>
        ⟷Canvas width: <OxButton half icon={"/2"} path="canvasSize.width" />
        <OxInputNumber path="canvasSize.width" />
        <OxButton double icon={"x2"} path="canvasSize.width" />
      </li>
      <li>
        ⭥Canvas height: <OxButton half icon={"/2"} path="canvasSize.height" />
        <OxInputNumber path="canvasSize.height" />
        <OxButton double icon={"x2"} path="canvasSize.height" />
      </li>
    </ul>
  )
}

export function TimePositionInputNumber() {
  let { context } = useContext(ReactContext)
  let [value, setValue] = useState(0)

  useEffect(() => {
    let remove = context.usePosition(({ posT }) => {
      setValue(posT)
    })
    return remove
  }, [])

  return (
    <InputNumber
      value={value}
      onChange={(posT) => {
        context.updatePosition((position) => ({ ...position, posT }))
      }}
    />
  )
}
