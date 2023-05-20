import { Button, Checkbox, Divider, Popover, Select, Space } from "antd"
import { useContext } from "react"
import { SketchPicker } from "react-color"

import { parseColorMap, presentColorMap } from "../../display/Display"
import { colorToHexColor } from "../../engine/color"
import { randomPalette } from "../../palette/randomPalette"
import { parseSideBorder, parseTopBorder } from "../../patternlang/parser"
import { presentSideBorder, presentTopBorder } from "../../patternlang/presenter"
import { ReactContext } from "../../state/ReactContext"
import { defaultColorMap } from "../../state/state"
import { Color } from "../../type"
import { OxButton, OxEnterInput, OxInput, OxInputNumber } from "../component"
import { useStateSelection } from "../hooks"
import { TimePositionInputNumber } from "./input/TimePositionInputNumber"
import { SideBorderCascader, TopBorderSelect } from "./topologySelect"

const { Option } = Select

export let SettingsUI = () => {
  let { context, act } = useContext(ReactContext)
  let [topologyKind, presentationMode] = useStateSelection(
    ({ topology: { kind }, presentationMode }) => [kind, presentationMode],
  )
  let topologyIsLoop = topologyKind == "loop"

  let { colorMap } = useStateSelection(({ colorMap }) => ({ colorMap }))

  return (
    <div>
      <div className="settingui-menu-column">
        <div>
          <p>
            <i className="fa fa-television" /> Display
          </p>
          <ul>
            <li>
              Speed: <Button icon={"/2"} onClick={() => act.halfSpeed()} />
              <OxInputNumber path="speed" />
              <Button icon={"x2"} onClick={() => act.doubleSpeed()} />
            </li>
            <li>
              🔎 Zoom: <Button icon={"/2"} onClick={() => act.halfZoom()} />
              <OxInputNumber path="zoom" />
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
          <Divider />
          <p>Engine</p>
          <ul>
            <li>
              Seed: <OxInput path="seed" />
              <Button icon={"🎲"} onClick={() => act.randomizeSeed()} />
            </li>
            <li>
              ⟷Simulation width: <OxButton half icon={"/2"} path="topology.width" />
              <OxInputNumber path="topology.width" />
              <OxButton double icon={"x2"} path="topology.width" />
              <br />
              <Button
                onClick={context.action((state) => {
                  state.topology.width = state.canvasSize.width
                  act.fixPosition(state)
                  state.redraw = true
                })}
              >
                Copy canvas width
              </Button>
              <Button
                onClick={context.action((state) => {
                  state.canvasSize.width = state.topology.width
                })}
              >
                Write width to canvas
              </Button>
            </li>
          </ul>
        </div>
      </div>
      <div className="settingui-menu-column">
        <div>
          <p>
            <i className="fa fa-circle-o" /> Topology
          </p>
          <ul>
            <li>
              <Button style={{ marginRight: "10px" }} onClick={() => act.setGenesis("(0)1(0)")()}>
                Impulse Mode 1
              </Button>
              <Button style={{ marginRight: "10px" }} onClick={() => act.setGenesis("(0)11(0)")()}>
                Impulse Mode 3
              </Button>
              <Button onClick={() => act.setRandomGenesis("([0001])([0111])")()}>
                Random Mode
              </Button>
            </li>
          </ul>
          <p>
            <Checkbox
              checked={presentationMode === "present"}
              onChange={(e) => {
                context.updateState(
                  (state) => (state.presentationMode = e.target.checked ? "present" : "off"),
                )
              }}
            />{" "}
            Presentation mode
          </p>
          <Divider />
          <ul>
            <li>
              Topology kind:{" "}
              <Select
                value={topologyKind}
                onChange={(value) => {
                  context.updateState((state) => {
                    state.topology.kind = value
                  })
                }}
              >
                <Option value="border">Border</Option>
                <Option value="loop">Loop</Option>
              </Select>
            </li>
            <li>
              ‴‴Genesis:
              <Space.Compact>
                <TopBorderSelect />
                <OxEnterInput
                  path="topology.genesis"
                  style={{ width: "initial" }}
                  present={presentTopBorder}
                  parse={parseTopBorder}
                />
              </Space.Compact>
            </li>
            <li>
              |⧘… Side Border Left:
              <Space.Compact>
                <SideBorderCascader side="borderLeft" disabled={topologyIsLoop} />
                <OxEnterInput
                  path="topology.borderLeft"
                  style={{ width: "initial" }}
                  disabled={topologyIsLoop}
                  present={presentSideBorder}
                  parse={parseSideBorder}
                />
              </Space.Compact>
            </li>
            <li>
              …⧙| Side Border Right:
              <Space.Compact>
                <SideBorderCascader side="borderRight" disabled={topologyIsLoop} />
                <OxEnterInput
                  disabled={topologyIsLoop}
                  style={{ width: "initial" }}
                  path="topology.borderRight"
                  present={presentSideBorder}
                  parse={parseSideBorder}
                />
              </Space.Compact>
            </li>
          </ul>
        </div>
      </div>
      <div className="settingui-menu-column">
        <div>
          <p>
            <i>🎨</i> Palette
          </p>
          <ul>
            {colorMap.map((c, k) => (
              <li key={k}>
                Color #{k}:{" "}
                <Popover
                  placement="bottomLeft"
                  title={`Select color #${k + 1}`}
                  content={
                    <SketchPicker
                      color={{ r: c.red, g: c.green, b: c.blue }}
                      onChange={({ rgb }) => {
                        context.updateState((state) => {
                          state.colorMap[k] = {
                            red: rgb.r,
                            green: rgb.g,
                            blue: rgb.b,
                          }
                        })
                      }}
                    />
                  }
                  trigger="click"
                >
                  <Button
                    style={{
                      borderRadius: 20,
                      borderWidth: 2,
                      borderColor: "#FFF",
                      backgroundColor: colorToHexColor(c),
                    }}
                  >
                    {" "}
                  </Button>
                </Popover>
              </li>
            ))}
            <li>
              <Button
                onClick={() => {
                  context.updateState((state) => {
                    let palette = randomPalette(state.colorMap.length - 1)
                    let reorderedPalette: Color[] = Array.from(palette, (_, k) => {
                      let half = Math.floor(k / 2)
                      if (k % 2 > 0) {
                        return palette[palette.length - 1 - half]
                      } else {
                        return palette[half]
                      }
                    })
                    state.colorMap = [state.colorMap[0], ...reorderedPalette]
                    state.redraw = true
                  })
                }}
              >
                Randomize palette
              </Button>
            </li>
            <li>
              <Button
                onClick={() => {
                  context.updateState((state) => {
                    state.colorMap = defaultColorMap()
                    state.redraw = true
                  })
                }}
              >
                Reset color palette
              </Button>
            </li>
            <li>
              Import, export palette:
              <OxInput
                style={{ display: "block", width: "100%" }}
                path="colorMap"
                present={presentColorMap}
                parse={parseColorMap}
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}