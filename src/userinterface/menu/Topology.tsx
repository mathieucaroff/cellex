import { Divider, Select, Space } from "antd"
import { useContext } from "react"

import { parseSideBorder } from "../../patternlang/parser"
import { presentSideBorder } from "../../patternlang/presenter"
import { ReactContext } from "../../state/ReactContext"
import { OxEnterInput } from "../components/OxEnterInput/OxEnterInput"
import { useStateSelection } from "../hooks"
import { MiscSettings } from "./MiscSettings"
import { SideBorderCascader } from "./topologySelect"

const { Option } = Select

export function Topology() {
  let { context } = useContext(ReactContext)
  let topologyKind = useStateSelection(({ topology: { kind } }) => kind)
  let topologyIsLoop = topologyKind == "loop"
  return (
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
              style={{ width: "20rem" }}
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
      <MiscSettings />
    </div>
  )
}
