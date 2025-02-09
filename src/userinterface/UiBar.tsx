import { EditOutlined } from "@ant-design/icons"
import { Button, Space } from "antd"
import { useContext } from "react"

import { randomGoodAutomaton } from "../engine/curatedAutomata"
import { parseTopBorder } from "../patternlang/parser"
import { presentTopBorder } from "../patternlang/presenter"
import { ReactContext } from "../state/ReactContext"
import { InterventionSelector } from "./Intervention"
import { PlayButton } from "./PlayButton"
import { RuleInput } from "./RuleInput"
import { OxEnterInput } from "./components/OxEnterInput/OxEnterInput"
import { AutomatonEditor } from "./editor/AutomatonEditor"
import { GalleryButton } from "./gallery/GalleryButton"
import { DocumentationPhone } from "./markdown/documentation"
import { Display } from "./menu/Display"
import { Engine } from "./menu/Engine"
import { MiscSettings } from "./menu/MiscSettings"
import { Palette } from "./menu/Palette"
import { ShorcutList } from "./menu/ShortcutList"
import { Topology } from "./menu/Topology"
import { TopBorderSelect } from "./menu/topologySelect"
import { OxPopover } from "./phone/OxPopover"

export interface UiBarProp {
  position: "top" | "bottom"
  shortcutList?: [string, string][]
  uiBarRef: React.RefObject<HTMLDivElement>
}

export function UiBar(prop: UiBarProp) {
  let { context } = useContext(ReactContext)

  return (
    <div ref={prop.uiBarRef} className="uiBar">
      <PlayButton />
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

      <OxPopover icon={<EditOutlined />} title="Intervention" content={<InterventionSelector />} />

      <OxPopover icon={<i className="fa fa-cog" />} title="Engine" content={<Engine />} />

      <OxPopover icon={<i className="fa fa-television" />} title="Display" content={<Display />} />

      <OxPopover icon={<i className="fa fa-circle-o" />} title="Topology" content={<Topology />} />

      <OxPopover icon={<i className="fa fa-cog" />} title="Misc" content={<MiscSettings />} />

      <OxPopover icon="🎨" title="Palette" content={<Palette />} />

      {prop.position === "bottom" ? (
        <>
          <OxPopover
            icon={<i className="fa fa-cog" />}
            title="Editor"
            content={<AutomatonEditor />}
          />
          <OxPopover
            icon={<i className="fa fa-book" />}
            title="Shortcuts"
            content={<ShorcutList list={prop.shortcutList} />}
          />
          <OxPopover
            icon={<i className="fa fa-book" />}
            title="Docs"
            content={<DocumentationPhone />}
          />
        </>
      ) : null}
    </div>
  )
}
