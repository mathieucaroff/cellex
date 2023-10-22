import { FullscreenOutlined, PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Button, Collapse, Popover, Space, Switch, Tooltip } from "antd"
import { useContext } from "react"
import { FaDiscord, FaGithub } from "react-icons/fa"

import { randomGoodAutomaton } from "../engine/curatedAutomata"
import { presentAutomaton } from "../nomenclature/nomenclature"
import { parseTopBorder } from "../patternlang/parser"
import { presentTopBorder } from "../patternlang/presenter"
import { ReactContext } from "../state/ReactContext"
import { RuleInput } from "./RuleInput"
import { OxButton } from "./components/OxButton/OxButton"
import { OxEnterInput } from "./components/OxEnterInput/OxEnterInput"
import { OxSelect } from "./components/OxSelect/OxSelect"
import { OxSwitch } from "./components/OxSwittch/OxSwitch"
import { AutomatonEditor } from "./editor/AutomatonEditor"
import { GalleryButton } from "./gallery/GalleryButton"
import { DivGraft } from "./graft"
import { useStateSelection } from "./hooks"
import { Documentation } from "./markdown/documentation"
import { SettingsUI } from "./menu/SettingsUI"
import { ShorcutList } from "./menu/ShortcutList"
import { TopBorderSelect } from "./menu/topologySelect"

interface UserInterfaceProp {
  shortcutList: [string, string][]
  displayDiv: HTMLDivElement
  repositoryUrl: string
  version: string
  discordInviteUrl: string
}

export let UserInterface = (prop: UserInterfaceProp) => {
  let { shortcutList, displayDiv, repositoryUrl, version, discordInviteUrl } = prop
  let { act, context } = useContext(ReactContext)
  let { automaton, divineMode, play, immersiveMode } = useStateSelection(
    ({ automaton, divineMode, immersiveMode, play }) => ({
      divineMode,
      immersiveMode,
      play,
      automaton,
    }),
  )

  if (immersiveMode === "immersive") {
    return <DivGraft element={displayDiv} />
  } else if (immersiveMode === "off") {
    return (
      <>
        <div>
          <h1 className="title">Cellex</h1>
          <p className="subtitle">Unidimensional Cellular Automaton Explorer</p>
          <Space className="socials">
            {discordInviteUrl && (
              <Tooltip title="Join the Cellex Discord server">
                <a href={discordInviteUrl}>
                  <FaDiscord size={40} />
                </a>
              </Tooltip>
            )}
            <Tooltip title={`Get the source code on GitHub (v${version})`}>
              <a href={repositoryUrl}>
                <FaGithub size={40} />
              </a>
            </Tooltip>
          </Space>
        </div>
        <Space direction="vertical">
          <div>
            <Space>
              <Button
                type="primary"
                title={play ? "pause" : "play"}
                size="large"
                icon={play ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => act.togglePlay()}
              />

              <OxButton
                path="immersiveMode"
                icon={<FullscreenOutlined />}
                switchValue={["off", "immersive"]}
              />

              <GalleryButton />
              <Button
                icon={"🎲"}
                title="Fully random automaton"
                onClick={() => {
                  context.updateState((state) => {
                    state.automaton = randomGoodAutomaton()
                  })
                }}
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
                <Popover
                  content={
                    divineMode.status !== "off" && (
                      <OxSwitch
                        title="Toggle propagation mode"
                        path="divineMode.propagation"
                        checkedChildren="propagation"
                        unCheckedChildren="intervention"
                      />
                    )
                  }
                >
                  <Switch
                    title="Toggle divine mode"
                    checkedChildren="divine"
                    unCheckedChildren="natural"
                    checked={divineMode.status !== "off"}
                    onChange={(checked) => {
                      if (checked) {
                        act.setDivineModeWaiting()
                      } else {
                        act.setDivineModeOff()
                      }
                    }}
                  />
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

        <Collapse
          accordion
          items={[
            {
              className: "automatonEditor",
              label: `Automaton Editor (${presentAutomaton(automaton).longDescriptor})`,
              key: "automatonEditor",
              children: <AutomatonEditor />,
            },
            {
              label: `Keyboard shortcuts`,
              key: "shortcutList",
              children: <ShorcutList list={shortcutList} />,
            },
            {
              label: `Documentation`,
              key: "documentation",
              children: <Documentation />,
            },
          ]}
        />
      </>
    )
  } else {
    throw new Error(`unexpected immersiveMode value: ${immersiveMode}`)
  }
}
