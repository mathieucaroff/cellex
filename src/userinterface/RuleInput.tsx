import { Space } from "antd"

import { TableRuleAutomaton } from "../automatonType"
import { randomGoodAutomatonFromDomain, randomGoodRule } from "../engine/curatedAutomata"
import { parseNomenclature, presentNomenclature } from "../nomenclature/nomenclature"
import { DomainSelect } from "./DomainSelect"
import { OxEnterInput } from "./components/OxEnterInput/OxEnterInput"
import { useStateSelection } from "./hooks"

export let RuleInput = () => {
  let rule = useStateSelection(({ automaton: rule }) => rule)

  return (
    <Space.Compact>
      <DomainSelect />
      <OxEnterInput
        path="automaton"
        id="automatonInput"
        title="Set the simulated rule"
        style={{ width: "initial" }}
        present={(rule: TableRuleAutomaton) => presentNomenclature(rule).descriptor}
        parse={parseNomenclature}
        randomizer={() => randomGoodAutomatonFromDomain(rule)}
        randomizer2={randomGoodRule}
        randomElementTitle={`Random rule on the same domain (ns${rule.neighborhoodSize},${rule.stateCount}c)`}
        randomElementTitle2={`Fully random rule`}
      />
    </Space.Compact>
  )
}
