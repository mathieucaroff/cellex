import { Input, Select } from "antd"
import { useContext } from "react"
import { parseSideBorder, parseTopBorder } from "../patternlang/parser"
import { presentSideBorder, presentTopBorder } from "../patternlang/presenter"
import { ReactContext } from "../state/reactcontext"
import { SideBorderCascader, TopBorderCascader } from "./topologycascader"
import { OxEnterInput } from "./component"

const { Option } = Select

interface TopologyContentProp {}
export let TopologyContent = (prop: TopologyContentProp) => {
    let { context } = useContext(ReactContext)

    let topologyIsLoop = context.getState().topology.kind == "loop"

    let ul = (
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
                Genesis:
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
                Side Border Left:
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
                Side Border Right:
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
    )
    return <div>{ul}</div>
}
