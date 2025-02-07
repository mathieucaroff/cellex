import { Button, Divider, Space } from "antd"
import { useContext } from "react"

import { ReactContext } from "../../state/ReactContext"
import { OxButton } from "../components/OxButton/OxButton"
import { OxInput } from "../components/OxInput/OxInput"
import { OxInputNumber } from "../components/OxInputNumber/OxInputNumber"
import { SpacialPositionInputNumber } from "./input/SpacialPositionInputNumber"
import { TimePositionInputNumber } from "./input/TimePositionInputNumber"

export function Engine() {
  let { context, act } = useContext(ReactContext)

  return (
    <div>
      <p>Engine</p>
      <ul>
        <li>
          ⟷Simulation width:{" "}
          <div>
            <OxButton half ceil icon={"/2"} path="topology.width" />
            <OxInputNumber path="topology.width" />
            <OxButton double icon={"x2"} path="topology.width" />
          </div>
          <div>
            <Button
              onClick={context.action((state) => {
                state.topology.width = state.canvasSize.width
                act.fixPosition(state)
              })}
            >
              ⤺ Copy canvas width
            </Button>
            <Button
              onClick={context.action((state) => {
                state.canvasSize.width = state.topology.width
              })}
            >
              ⤻ Write width to canvas
            </Button>
          </div>
        </li>
        <li>
          Seed:
          <div>
            <Space.Compact>
              <OxInput path="seed" />
              <Button icon={"🎲"} onClick={() => act.randomizeSeed()} />
            </Space.Compact>
          </div>
        </li>
      </ul>
      <Divider />
      <p>
        <i className="fa fa-television" /> Display
      </p>
      <ul>
        <li>
          Speed:{" "}
          <div>
            <Button icon={"/2"} onClick={() => act.halfSpeed()} />
            <OxInputNumber path="speed" />
            <Button icon={"x2"} onClick={() => act.doubleSpeed()} />
          </div>
        </li>
        <li>
          🔎 Zoom:{" "}
          <div>
            <Button icon={"/2"} onClick={() => act.halfZoom()} />
            <OxInputNumber path="zoom" />
            <Button icon={"x2"} onClick={() => act.doubleZoom()} />
          </div>
        </li>
        <li>
          ⌖Space position:{" "}
          <div>
            <SpacialPositionInputNumber />
          </div>
        </li>
        <li>
          ⌖Time position (generation):{" "}
          <div>
            <TimePositionInputNumber />
            <Button onClick={() => act.gotoTop()}>GO TO TOP</Button>
          </div>
        </li>
        <li>
          ⟷Canvas width:{" "}
          <div>
            <OxButton half ceil icon={"/2"} path="canvasSize.width" />
            <OxInputNumber path="canvasSize.width" />
            <OxButton double icon={"x2"} path="canvasSize.width" />
          </div>
        </li>
        <li>
          ⭥Canvas height:{" "}
          <div>
            <OxButton half ceil icon={"/2"} path="canvasSize.height" />
            <OxInputNumber path="canvasSize.height" />
            <OxButton double icon={"x2"} path="canvasSize.height" />
          </div>
        </li>
      </ul>
    </div>
  )
}
