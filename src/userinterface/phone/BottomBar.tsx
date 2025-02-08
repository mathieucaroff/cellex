import { EditOutlined } from "@ant-design/icons"
import { Button, Popover, Space } from "antd"

import { parseTopBorder } from "../../patternlang/parser"
import { presentTopBorder } from "../../patternlang/presenter"
import { InterventionSelector } from "../Intervention"
import { PlayButton } from "../PlayButton"
import { RuleInput } from "../RuleInput"
import { OxEnterInput } from "../components/OxEnterInput/OxEnterInput"
import { AutomatonEditor } from "../editor/AutomatonEditor"
import { GalleryButton } from "../gallery/GalleryButton"
import { DocumentationPhone } from "../markdown/documentation"
import { Engine } from "../menu/Engine"
import { Palette } from "../menu/Palette"
import { Topology } from "../menu/Topology"
import { TopBorderSelect } from "../menu/topologySelect"

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

      <Popover
        placement="top"
        title="Intervention"
        content={<InterventionSelector />}
        trigger="click"
      >
        <Button>
          <EditOutlined />
          Intervention
        </Button>
      </Popover>

      <Popover placement="top" title="Engine" content={<Engine />} trigger="click">
        <Button>
          <i className="fa fa-cog" style={{ marginRight: "8px" }} />
          Engine
        </Button>
      </Popover>

      <Popover placement="top" title="Topology" content={<Topology />} trigger="click">
        <Button>
          <i className="fa fa-cog" style={{ marginRight: "8px" }} />
          Topology
        </Button>
      </Popover>

      <Popover placement="top" title="Palette" content={<Palette />} trigger="click">
        <Button>
          <i className="fa fa-cog" style={{ marginRight: "8px" }} />
          Palette
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
      <Popover
        placement="top"
        title="Documentation"
        content={<DocumentationPhone />}
        trigger="click"
      >
        <Button>
          <i className="fa fa-cog" style={{ marginRight: "8px" }} />
          Docs
        </Button>
      </Popover>
    </div>
  )
}
