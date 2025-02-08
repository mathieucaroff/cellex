import { FullscreenOutlined } from "@ant-design/icons"
import { Button, Collapse, Popover, Space } from "antd"
import { useContext } from "react"

import { randomGoodAutomaton } from "../engine/curatedAutomata"
import { presentAutomaton } from "../nomenclature/nomenclature"
import { parseTopBorder } from "../patternlang/parser"
import { presentTopBorder } from "../patternlang/presenter"
import { ReactContext } from "../state/ReactContext"
import { InterventionSelector } from "./Intervention"
import { PlayButton } from "./PlayButton"
import { RuleInput } from "./RuleInput"
import { UserInterfaceProp } from "./UserInterface"
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
import { Social } from "./social/Social"

export function UserInterfaceDesktop(prop: UserInterfaceProp) {
  let { shortcutList, displayDiv } = prop
  let { context } = useContext(ReactContext)
  let { automaton } = useStateSelection(({ automaton }) => ({ automaton }))

  return (
    <>
      <div>
        <h1 className="title">Cellex</h1>
        <p className="subtitle">Unidimensional Cellular Automaton Explorer</p>
        <Social />
      </div>
      <Space direction="vertical">
        <div className="headerContainer">
          <Space style={{ display: "flex" }}>
            <PlayButton />
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
}
