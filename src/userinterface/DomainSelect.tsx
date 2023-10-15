import { Select } from "antd"
import { useContext } from "react"

import { generateSupportedDomainArray } from "../engine/domain"
import { parseAutomaton } from "../nomenclature/nomenclature"
import { parseTopBorder } from "../patternlang/parser"
import { ReactContext } from "../state/ReactContext"

export let DomainSelect = () => {
  let { context } = useContext(ReactContext)

  return (
    <Select
      title="Select a domain"
      value=""
      style={{ width: "34px" }}
      dropdownStyle={{ minWidth: "340px", height: "" }}
      options={generateSupportedDomainArray()}
      listHeight={400}
      onChange={(value) => {
        context.updateState((state) => {
          state.automaton = parseAutomaton(value)
          state.topology.genesis = parseTopBorder("1(0)")
        })
      }}
    />
  )
}
