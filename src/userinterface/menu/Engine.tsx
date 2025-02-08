import { Button, Space } from "antd"
import { useContext } from "react"

import { ReactContext } from "../../state/ReactContext"
import { OxButton } from "../components/OxButton/OxButton"
import { OxInput } from "../components/OxInput/OxInput"
import { OxInputNumber } from "../components/OxInputNumber/OxInputNumber"

export function Engine() {
  let { context, act } = useContext(ReactContext)

  return (
    <div>
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
    </div>
  )
}
