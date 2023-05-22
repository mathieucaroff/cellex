import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Button, Collapse, Space } from "antd"
import { useContext } from "react"

import { presentNomenclature } from "../nomenclature/nomenclature"
import { parseTopBorder } from "../patternlang/parser"
import { presentTopBorder } from "../patternlang/presenter"
import { ReactContext } from "../state/ReactContext"
import { RuleInput } from "./RuleInput"
import { TopMenu } from "./TopMenu"
import { OxEnterInput } from "./component"
import { RuleEditor } from "./editor/RuleEditor"
import { DivGraft } from "./graft"
import { useStateSelection } from "./hooks"
import { Documentation } from "./markdown/documentation"
import { TopBorderSelect } from "./menu/topologySelect"

const { Panel } = Collapse
interface UserInterfaceProp {
  helpList: [string, string][]
  displayDiv: HTMLDivElement
}

export let UserInterface = (prop: UserInterfaceProp) => {
  let { helpList, displayDiv } = prop
  let { act } = useContext(ReactContext)
  let { rule, diffMode, play } = useStateSelection(({ rule, diffMode, play }) => ({
    rule,
    diffMode,
    play,
  }))

  let collapseProp: any = {}
  if (window.location.hash) {
    collapseProp["defaultActiveKey"] = 3
  }

  return (
    <>
      <div>
        <h1 className="title" title="Cellex">
          Cellex
        </h1>
        <p className="subtitle">Monodimensional Cellular Automaton Explorer</p>
      </div>
      <Space direction="vertical">
        <Space>
          <Button
            type="primary"
            title="play"
            size="large"
            icon={play ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => act.togglePlay()}
          />
          <RuleInput />

          <Space.Compact>
            <TopBorderSelect />
            <OxEnterInput
              title="genesis: set the initial generation"
              path="topology.genesis"
              style={{ width: "initial" }}
              present={presentTopBorder}
              parse={parseTopBorder}
            />
          </Space.Compact>

          <TopMenu diffMode={diffMode} helpList={helpList} act={act} />
        </Space>

        {/* /\ -------------------- /\ */}
        {/* || DISPLAY ELEMENT HERE || */}
        <DivGraft element={displayDiv} />
        {/* || DISPLAY ELEMENT HERE || */}
        {/* \/ -------------------- \/ */}
      </Space>

      <Collapse accordion {...collapseProp}>
        <Panel
          className="ruleEditor"
          header={`Rule Editor (${presentNomenclature(rule).longDescriptor})`}
          key="ruleEditor"
        >
          <RuleEditor />
        </Panel>
        <Panel header={`Documentation`} key="documentation">
          <Documentation />
        </Panel>
      </Collapse>
    </>
  )
}
