import {
  DiffOutlined,
  FullscreenOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons"
import { Button, Collapse, Popover, Space } from "antd"
import React, { ReactNode, useContext } from "react"

import { presentNomenclature } from "../nomenclature/nomenclature"
import { parseTopBorder } from "../patternlang/parser"
import { presentTopBorder } from "../patternlang/presenter"
import { ReactContext } from "../state/ReactContext"
import { RuleInput } from "./RuleInput"
import { OxButton } from "./components/OxButton/OxButton"
import { OxEnterInput } from "./components/OxEnterInput/OxEnterInput"
import { OxSelect } from "./components/OxSelect/OxSelect"
import { RuleEditor } from "./editor/RuleEditor"
import { GalleryButton } from "./gallery/GalleryButton"
import { DivGraft } from "./graft"
import { useStateSelection } from "./hooks"
import { Documentation } from "./markdown/documentation"
import { HelpContent } from "./menu/HelpContent"
import { SettingsUI } from "./menu/SettingsUI"
import { TopBorderSelect } from "./menu/topologySelect"

const { Panel } = Collapse
interface UserInterfaceProp {
  helpList: [string, string][]
  displayDiv: HTMLDivElement
}

export let UserInterface = (prop: UserInterfaceProp) => {
  let { helpList, displayDiv } = prop
  let { act } = useContext(ReactContext)
  let { rule, diffMode, play, immersiveMode } = useStateSelection(
    ({ rule, diffMode, immersiveMode, play }) => ({
      diffMode,
      immersiveMode,
      play,
      rule,
    }),
  )

  let collapseProp: any = {}
  if (window.location.hash) {
    collapseProp["defaultActiveKey"] = 3
  }

  if (immersiveMode === "immersive") {
    return <DivGraft element={displayDiv} />
  } else if (immersiveMode === "off") {
    return (
      <>
        <div>
          <h1 className="title" title="Cellex">
            Cellex
          </h1>
          <p className="subtitle">Unidimensional Cellular Automaton Explorer</p>
        </div>
        <Space direction="vertical">
          <div>
            <Space>
              <Button
                type="primary"
                title="play"
                size="large"
                icon={play ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => act.togglePlay()}
              />

              <GalleryButton />

              <OxButton
                path="immersiveMode"
                icon={<FullscreenOutlined />}
                switchValue={["off", "immersive"]}
              />

              <RuleInput />

              <Space.Compact>
                <TopBorderSelect />
                <OxEnterInput
                  title="Set the simluation genesis"
                  path="topology.genesis"
                  style={{ width: "initial" }}
                  present={presentTopBorder}
                  parse={parseTopBorder}
                />
              </Space.Compact>

              <div className="topMenu">
                <Popover
                  placement="bottom"
                  title="Settings"
                  content={<SettingsUI />}
                  trigger="click"
                >
                  <Button>
                    <i className="fa fa-cog" />
                    Settings
                  </Button>
                </Popover>
                <Button
                  type={diffMode.status !== "off" ? "primary" : "default"}
                  title={
                    "Toggle the Differential Mode " + (diffMode.status !== "off" ? "off" : "on")
                  }
                  icon={<DiffOutlined />}
                  onClick={() => act.toggleDifferentialMode()}
                />
                <Popover
                  placement="bottomLeft"
                  content={<HelpContent helpList={helpList} />}
                  trigger="click"
                >
                  <Button title="Help">?</Button>
                </Popover>
              </div>
            </Space>
            <div style={{ float: "right" }}>
              <OxSelect path="darkMode" valueArray={["dark", "light"]} />
            </div>
          </div>

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
  } else {
    throw new Error(`unexpected immersiveMode value: ${immersiveMode}`)
  }
}
