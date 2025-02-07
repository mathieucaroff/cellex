import { Button, Popover, Space } from "antd"

import { parseTopBorder } from "../../patternlang/parser"
import { presentTopBorder } from "../../patternlang/presenter"
import { PlayButton } from "../PlayButton"
import { RuleInput } from "../RuleInput"
import { OxEnterInput } from "../components/OxEnterInput/OxEnterInput"
import { AutomatonEditor } from "../editor/AutomatonEditor"
import { GalleryButton } from "../gallery/GalleryButton"
import { Documentation } from "../markdown/documentation"
import { TopBorderSelect } from "../menu/topologySelect"
import { SettingsPhoneUI } from "./SettingsPhoneUI"

export function BottomBar() {
  return (
    <div
      style={{
        margin: "10px 10px 10px 10px",
        position: "absolute",
        bottom: "0px",
        display: "inline-flex",
        flexWrap: "wrap",
        gap: "12px 8px",
      }}
    >
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
          Settings
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
          Editor
        </Button>
      </Popover>
      <Popover placement="top" title="Documentation" content={<Documentation />} trigger="click">
        <Button>
          <i className="fa fa-cog" style={{ marginRight: "8px" }} />
          Docs
        </Button>
      </Popover>
    </div>
  )
}
