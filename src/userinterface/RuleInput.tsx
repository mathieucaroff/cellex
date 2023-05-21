import { Space } from "antd"
import { useContext } from "react"

import { randomGoodRule, randomGoodRuleFromDomain } from "../engine/rule"
import { parseNomenclature, presentNomenclature } from "../nomenclature/nomenclature"
import { Rule } from "../ruleType"
import { ReactContext } from "../state/ReactContext"
import { RuleCascader } from "./RuleCascader"
import { OxEnterInput } from "./component"
import { useStateSelection } from "./hooks"

export let RuleInput = () => {
  let { act } = useContext(ReactContext)
  let rule = useStateSelection(({ rule }) => rule)

  return (
    <Space.Compact>
      <RuleCascader />
      <OxEnterInput
        path="rule"
        id="ruleInput"
        title="set rule"
        style={{ width: "initial" }}
        present={(rule: Rule) => presentNomenclature(rule).descriptor}
        parse={parseNomenclature}
        randomizer={() => randomGoodRuleFromDomain(rule)}
        randomizer2={randomGoodRule}
        randomElementTitle={`Random rule on the same domain (ns${rule.neighborhoodSize},${rule.stateCount}c)`}
        randomElementTitle2={`Fully random rule`}
        extraOnPressEnter={act.focus("displayDiv")}
      />
    </Space.Compact>
  )
}
