import { Collapse, Space } from "antd"

import { presentAutomaton } from "../nomenclature/nomenclature"
import { UiBar } from "./UiBar"
import { UserInterfaceProp } from "./UserInterface"
import { AutomatonEditor } from "./editor/AutomatonEditor"
import { DivGraft } from "./graft"
import { useStateSelection } from "./hooks"
import { Documentation } from "./markdown/documentation"
import { ShorcutList } from "./menu/ShortcutList"
import { Social } from "./social/Social"

export function UserInterfaceDesktop(prop: UserInterfaceProp) {
  let { shortcutList, displayDiv, uiBarRef } = prop
  let { automaton } = useStateSelection(({ automaton }) => ({ automaton }))

  return (
    <>
      <div>
        <h1 className="title">Cellex</h1>
        <p className="subtitle">Unidimensional Cellular Automaton Explorer</p>
        <Social />
      </div>
      <Space direction="vertical">
        <UiBar position="top" uiBarRef={uiBarRef} />
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
