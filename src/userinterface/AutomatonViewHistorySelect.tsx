import { HistoryOutlined } from "@ant-design/icons"
import { Select } from "antd"
import { useContext } from "react"

import { parseAutomaton } from "../nomenclature/nomenclature"
import { parseTopBorder } from "../patternlang/parser"
import { ReactContext } from "../state/ReactContext"
import { AutomatonCanvas } from "./gallery/AutomatonCanvas"
import { useStateSelection } from "./hooks"

function getRow(entry: string) {
  let [automaton, genesis] = entry.split("@")

  return (
    <div className="automatonViewRow">
      <AutomatonCanvas
        className="automatonViewRowCanvas"
        descriptor={automaton}
        genesis={genesis}
        width={100}
        height={50}
      />
      <div className="automatonViewRowText">
        <p className="automatonText">{automaton}</p>
        <p className="genesisText">{genesis}</p>
      </div>
    </div>
  )
}

export let AutomatonViewHistorySelect = () => {
  let { context } = useContext(ReactContext)
  let history = useStateSelection((s) => s.history)

  return (
    <Select
      suffixIcon={<HistoryOutlined />}
      title="Select a past automaton view"
      value=""
      style={{ width: "34px" }}
      dropdownStyle={{ minWidth: "340px", height: "" }}
      options={history.map((value) => ({ label: getRow(value), value }))}
      listHeight={400}
      onChange={(value) => {
        let [automatonString, genesisString] = value.split("@")
        context.updateState((state) => {
          state.automaton = parseAutomaton(automatonString)
          state.topology.genesis = parseTopBorder(genesisString)
        })
      }}
    />
  )
}
