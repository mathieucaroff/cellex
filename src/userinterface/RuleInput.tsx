import { Space } from "antd"

import { TableRuleAutomaton } from "../automatonType"
import { randomGoodRuleFromDomain } from "../engine/curatedAutomata"
import { parseAutomaton, presentAutomaton, presentDomain } from "../nomenclature/nomenclature"
import { DomainSelect } from "./DomainSelect"
import { OxEnterInput } from "./components/OxEnterInput/OxEnterInput"
import { useStateSelection } from "./hooks"

export let RuleInput = () => {
  let a = useStateSelection(({ automaton }) => automaton)

  let domain = presentDomain(a).descriptor
  let randomElementTitle =
    domain !== "e"
      ? `Random automaton on the same domain (${domain})`
      : `Random elementary ${a.kind === "tableRule" ? "rule" : "code"}`

  return (
    <Space.Compact>
      <DomainSelect />
      <OxEnterInput
        path="automaton"
        id="automatonInput"
        title="Set the simulated rule"
        style={{ width: "initial" }}
        present={(rule: TableRuleAutomaton) => presentAutomaton(rule).descriptor}
        parse={parseAutomaton}
        randomizer={() => randomGoodRuleFromDomain(a)}
        randomElementTitle={randomElementTitle}
      />
    </Space.Compact>
  )
}
