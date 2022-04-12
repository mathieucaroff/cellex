import { Button, Divider, Input, Select } from "antd"
import { useContext } from "react"
import { parseSideBorder, parseTopBorder } from "../../patternlang/parser"
import { presentSideBorder, presentTopBorder } from "../../patternlang/presenter"
import { ReactContext } from "../../state/ReactContext"
import { OxButton, OxEnterInput, OxInput, OxInputNumber } from "../component"
import { SideBorderCascader, TopBorderCascader } from "./topologyCascader"

const { Option } = Select

interface TopologyContentProp {}
export let EngineUI = (prop: TopologyContentProp) => {
    let { context } = useContext(ReactContext)

    let topologyIsLoop = context.getState().topology.kind == "loop"

    let div = (
        <div>
            <p>Engine</p>
            <ul>
                <li>
                    Seed: <OxInput path="seed" />
                    <Button
                        icon={"🎲"}
                        onClick={() => {
                            context.updateState((state) => {
                                state.seed = Math.random().toString(36).slice(2)
                            })
                        }}
                    />
                </li>
                <li>
                    ⟷Simulation width: <OxButton half icon={"/2"} path="topology.width" />
                    <OxInputNumber path="topology.width" />
                    <OxButton double icon={"x2"} path="topology.width" />
                    <br />
                    <Button
                        onClick={context.action((state) => {
                            state.topology.width = state.canvasSize.width
                        })}
                    >
                        Copy from canvas
                    </Button>
                    <Button
                        onClick={context.action((state) => {
                            state.canvasSize.width = state.topology.width
                        })}
                    >
                        Write to canvas
                    </Button>
                </li>
            </ul>
            <Divider />
            <p>Topology</p>
            <ul>
                <li>
                    Topology kind:{" "}
                    <Select
                        value={context.getState().topology.kind}
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
                    <Input.Group compact>
                        <TopBorderCascader />
                        <OxEnterInput
                            path="topology.genesis"
                            style={{ width: "initial" }}
                            present={presentTopBorder}
                            parse={parseTopBorder}
                        />
                    </Input.Group>
                </li>
                <li>
                    |⧘… Side Border Left:
                    <Input.Group compact>
                        <SideBorderCascader side="borderLeft" disabled={topologyIsLoop} />
                        <OxEnterInput
                            path="topology.borderLeft"
                            style={{ width: "initial" }}
                            disabled={topologyIsLoop}
                            present={presentSideBorder}
                            parse={parseSideBorder}
                        />
                    </Input.Group>
                </li>
                <li>
                    …⧙| Side Border Right:
                    <Input.Group compact>
                        <SideBorderCascader side="borderRight" disabled={topologyIsLoop} />
                        <OxEnterInput
                            disabled={topologyIsLoop}
                            style={{ width: "initial" }}
                            path="topology.borderRight"
                            present={presentSideBorder}
                            parse={parseSideBorder}
                        />
                    </Input.Group>
                </li>
            </ul>
        </div>
    )
    return div
}
