import { Checkbox, Select } from "antd"
import { useContext } from "react"
import { parseSideBorder, parseTopBorder } from "../patternlang/parser"
import { presentSideBorder, presentTopBorder } from "../patternlang/presenter"
import { ReactContext } from "../state/reactcontext"
import { OxCheckbox, OxEnterInput } from "./component"

const { Option } = Select

interface BorderContentProp {}
export let BorderContent = (prop: BorderContentProp) => {
    let { context } = useContext(ReactContext)
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
                Genesis:{" "}
                <OxEnterInput
                    path="topology.genesis"
                    present={presentTopBorder}
                    parse={parseTopBorder}
                />
            </li>
            <li>
                Side Border Left:{" "}
                <OxEnterInput
                    path="topology.borderLeft"
                    disabled={context.getState().topology.kind == "loop"}
                    present={presentSideBorder}
                    parse={parseSideBorder}
                />
            </li>
            <li>
                Side Border Right:{" "}
                <OxEnterInput
                    disabled={context.getState().topology.kind == "loop"}
                    path="topology.borderRight"
                    present={presentSideBorder}
                    parse={parseSideBorder}
                />
            </li>
        </ul>
    )
    return <div>{ul}</div>
}
