import { Button, Popover, Space } from "antd"

import { parseTopBorder } from "../../patternlang/parser"
import { presentTopBorder } from "../../patternlang/presenter"
import { PlayButton } from "../PlayButton"
import { RuleInput } from "../RuleInput"
import { OxButton } from "../components/OxButton/OxButton"
import { OxEnterInput } from "../components/OxEnterInput/OxEnterInput"
import { AutomatonEditor } from "../editor/AutomatonEditor"
import { GalleryButton } from "../gallery/GalleryButton"
import { useStateSelection } from "../hooks"
import { Documentation } from "../markdown/documentation"
import { TopBorderSelect } from "../menu/topologySelect"
import { SettingsPhoneUI } from "./SettingsPhoneUI"

export function BottomBar() {
  let darkMode = useStateSelection(({ darkMode }) => darkMode)

  return (
    <>
      <PlayButton />
      <GalleryButton />
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
      <Popover placement="top" title="Settings" content={<SettingsPhoneUI />} trigger="click">
        <Button>
          <i className="fa fa-cog" style={{ marginRight: "8px" }} />
        </Button>
      </Popover>
      <Popover
        placement="top"
        title="Automaton Editor"
        content={<AutomatonEditor />}
        trigger="click"
      >
        <Button>
          <i className="fa fa-cog" style={{ marginRight: "8px" }} />
        </Button>
      </Popover>
      <Popover placement="top" title="Documentation" content={<Documentation />} trigger="click">
        <Button>
          <i className="fa fa-cog" style={{ marginRight: "8px" }} />
        </Button>
      </Popover>
      <OxButton
        path="darkMode"
        switchValue={["dark", "light"]}
        className="themeSelect"
        title="Select a theme"
      >
        <i className={`fa fa-${darkMode ? "sun" : "moon"}`} style={{ marginRight: "8px" }} />
      </OxButton>
    </>
  )
}
