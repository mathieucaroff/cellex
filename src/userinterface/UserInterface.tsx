import { FullscreenOutlined, PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Button, Collapse, Popover, Space, Tooltip } from "antd"
import { useContext } from "react"
import { FaDiscord, FaGithub } from "react-icons/fa"

import { randomGoodAutomaton } from "../engine/curatedAutomata"
import { presentAutomaton } from "../nomenclature/nomenclature"
import { parseTopBorder } from "../patternlang/parser"
import { presentTopBorder } from "../patternlang/presenter"
import { ReactContext } from "../state/ReactContext"
import { InterventionSelector } from "./Intervention"
import { RuleInput } from "./RuleInput"
import { OxButton } from "./components/OxButton/OxButton"
import { OxEnterInput } from "./components/OxEnterInput/OxEnterInput"
import { OxSelect } from "./components/OxSelect/OxSelect"
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
  let { automaton, play, immersiveMode } = useStateSelection(
    ({ automaton, immersiveMode, play }) => ({ immersiveMode, play, automaton }),
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
          <div className="headerContainer">
            <Space style={{ display: "flex" }}>
              <Button
                type="primary"
                title={play ? "pause" : "play"}
                icon={play ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={() => act.togglePlay()}
              />

              <OxButton
                path="immersiveMode"
                icon={<FullscreenOutlined />}
                switchValue={["off", "immersive"]}
                title={"Enable immersive mode"}
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
                  miniLabel="initialization"
                  style={{ width: "initial" }}
                  present={presentTopBorder}
                  parse={parseTopBorder}
                  lax
                />
              </Space.Compact>

              <InterventionSelector />
              <Popover placement="bottom" title="Settings" content={<SettingsUI />} trigger="click">
                <Button>
                  <i className="fa fa-cog" style={{ marginRight: "8px" }} />
                  Settings
                </Button>
              </Popover>
            </Space>
            <div>
              <OxSelect
                path="darkMode"
                valueArray={["dark", "light"]}
                className="themeSelect"
                title="Select a theme"
              />
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
