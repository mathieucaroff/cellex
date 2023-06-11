import { Space } from "antd"

import { randomGoodRule, randomGoodRuleFromDomain } from "../engine/rule"
import { parseNomenclature, presentNomenclature } from "../nomenclature/nomenclature"
import { TableRule } from "../ruleType"
import { DomainSelect } from "./DomainSelect"
import { OxEnterInput } from "./components/OxEnterInput/OxEnterInput"
import { useStateSelection } from "./hooks"

export let RuleInput = () => {
  let rule = useStateSelection(({ rule }) => rule)

  return (
    <Space.Compact>
      <DomainSelect />
      <OxEnterInput
        path="rule"
        id="ruleInput"
        title="Set the simulated rule"
        style={{ width: "initial" }}
        present={(rule: TableRule) => presentNomenclature(rule).descriptor}
        parse={parseNomenclature}
        randomizer={() => randomGoodRuleFromDomain(rule)}
        randomizer2={randomGoodRule}
        randomElementTitle={`Random rule on the same domain (ns${rule.neighborhoodSize},${rule.stateCount}c)`}
        randomElementTitle2={`Fully random rule`}
      />
    </Space.Compact>
  )
}
