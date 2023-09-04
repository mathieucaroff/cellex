import { Button, Checkbox, ColorPicker, Divider, Popover, Select, Space } from "antd"
import { useContext } from "react"

import { parseColorMap, presentColorMap } from "../../display/Display"
import { colorToHexColor } from "../../engine/color"
import { presentNomenclature } from "../../nomenclature/nomenclature"
import { randomPalette } from "../../palette/randomPalette"
import { parseSideBorder } from "../../patternlang/parser"
import { presentSideBorder, presentTopBorder } from "../../patternlang/presenter"
import { ReactContext } from "../../state/ReactContext"
import { defaultColorMap, oldColorMap } from "../../state/state"
import { Color } from "../../type"
import { OxButton } from "../components/OxButton/OxButton"
import { OxEnterInput } from "../components/OxEnterInput/OxEnterInput"
import { OxInput } from "../components/OxInput/OxInput"
import { OxInputNumber } from "../components/OxInputNumber/OxInputNumber"
import { useStateSelection } from "../hooks"
import { SpacialPositionInputNumber } from "./input/SpacialPositionInputNumber"
import { TimePositionInputNumber } from "./input/TimePositionInputNumber"
import { SideBorderCascader } from "./topologySelect"

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
      <div className="settingsUiMenuColumn">
        <div>
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
          <Divider />
          <p>Engine</p>
          <ul>
            <li>
              Seed:{" "}
              <Space.Compact>
                <OxInput path="seed" />
                <Button icon={"🎲"} onClick={() => act.randomizeSeed()} />
              </Space.Compact>
            </li>
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
                  Copy canvas width
                </Button>
                <Button
                  onClick={context.action((state) => {
                    state.canvasSize.width = state.topology.width
                  })}
                >
                  Write width to canvas
                </Button>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="settingsUiMenuColumn">
        <div>
          <p>
            <i className="fa fa-circle-o" /> Topology
          </p>
          <ul>
            <li>
              Topology kind:{" "}
              <div>
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
              </div>
            </li>
            <li>
              |⧘… Side Border Left:
              <div>
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
              </div>
            </li>
            <li>
              …⧙| Side Border Right:
              <div>
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
              </div>
            </li>
          </ul>
          <Divider />
          <p>Misc</p>
          <ul>
            <li>
              <p>
                <Button style={{ marginRight: "10px" }} onClick={() => act.setGenesis("(0)1(0)")()}>
                  Impulse Mode 1
                </Button>
                <Button
                  style={{ marginRight: "10px" }}
                  onClick={() => act.setGenesis("(0)11(0)")()}
                >
                  Impulse Mode 3
                </Button>
                <Button onClick={() => act.setRandomGenesis("([0001])([0111])")()}>
                  Random Mode
                </Button>
              </p>
            </li>
            <li>
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
            </li>
            <li>
              <p>
                <Button
                  onClick={() => {
                    const state = context.getState()
                    const automatonName = presentNomenclature(state.automaton).descriptor
                    const genesis = presentTopBorder(state.topology.genesis)
                    let url = new URL(location.href)
                    url.searchParams.set("genesis", genesis)
                    url.searchParams.set("automaton", automatonName)
                    history.pushState(null, "", url)
                  }}
                >
                  Export config to URL
                </Button>
              </p>
            </li>
          </ul>
        </div>
      </div>
      <div className="settingsUiMenuColumn">
        <div>
          <p>
            <i>🎨</i> Palette
          </p>
          <ul>
            {colorMap.map((c, k) => (
              <li key={k}>
                Color #{k}:{" "}
                <ColorPicker
                  showText
                  value={{ r: c.red, g: c.green, b: c.blue } as any}
                  onChange={(color) => {
                    const rgb = color.toRgb()
                    context.updateState((state) => {
                      state.colorMap[k] = {
                        red: rgb.r,
                        green: rgb.g,
                        blue: rgb.b,
                      }
                    })
                  }}
                />
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
                    state.colorMap = parseColorMap(oldColorMap)
                  })
                }}
              >
                Use the old color map
              </Button>
              <Button
                onClick={() => {
                  context.updateState((state) => {
                    state.colorMap = parseColorMap(defaultColorMap)
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
