import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Button, Collapse, ConfigProvider, Space, theme as antdTheme } from "antd"
import { useContext } from "react"

import { ruleName } from "../engine/rule"
import { ReactContext } from "../state/ReactContext"
import { RuleInput } from "./RuleInput"
import { TopMenu } from "./TopMenu"
import { RuleEditor } from "./editor/RuleEditor"
import { DivGraft } from "./graft"
import { useStateSelection } from "./hooks"
import { Documentation } from "./markdown/documentation"

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

  let collapseProp = {}
  if (window.location.hash) {
    collapseProp["defaultActiveKey"] = 3
  }

  return (
    <ConfigProvider theme={{ algorithm: [antdTheme.darkAlgorithm] }}>
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
    </ConfigProvider>
  )
}
