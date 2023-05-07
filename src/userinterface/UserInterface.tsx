import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Button, Collapse, PageHeader, Space } from "antd"
import { Act } from "../control/Act"
import { ruleName } from "../engine/rule"
import { Context } from "../state/Context"
import { ReactContext } from "../state/ReactContext"
import { DivGraft } from "./graft"
import { RuleEditor } from "./editor/RuleEditor"
import { RuleInput } from "./RuleInput"
import { TopMenu } from "./TopMenu"
import { Documentation } from "./markdown/documentation"

const { Panel } = Collapse
interface UserInterfaceProp {
  act: Act
  context: Context
  helpList: [string, string][]
  displayDiv: HTMLDivElement
}

export let UserInterface = (prop: UserInterfaceProp) => {
  let { act, context, helpList, displayDiv } = prop
  let { rule, diffMode } = context.getState()

  let collapseProp = {}
  if (window.location.hash) {
    collapseProp["defaultActiveKey"] = 3
  }

  return (
    <ReactContext.Provider value={{ act, context }}>
      <PageHeader
        className="site-page-header"
        onBack={() => {
          location.assign(".")
        }}
        title="Cellex"
        subTitle="Monodimensional Cellular Automaton Explorer"
      />
      <Space direction="vertical">
        <Space>
          <Button
            type="primary"
            title="play"
            size="large"
            icon={context.getState().play ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => {
              act.togglePlay()
              displayDiv.focus()
            }}
          />
          <RuleInput />

          <TopMenu diffMode={diffMode} helpList={helpList} act={act} />
        </Space>

        {/* /\ -------------------- /\ */}
        {/* || DISPLAY ELEMENT HERE || */}
        <DivGraft element={displayDiv} />
        {/* || DISPLAY ELEMENT HERE || */}
        {/* \/ -------------------- \/ */}
      </Space>

      <Collapse accordion {...collapseProp}>
        <Panel className="ruleEditor" header={`Rule Editor (${ruleName(rule)})`} key={1}>
          <RuleEditor />
        </Panel>
        <Panel header={`Documentation`} key={3}>
          <Documentation />
        </Panel>
      </Collapse>
    </ReactContext.Provider>
  )
}
