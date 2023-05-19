import { Space } from "antd"
import { useContext } from "react"

import { randomGoodRule, randomGoodRuleFromDomain } from "../engine/rule"
import { parseNomenclature, presentNomenclature } from "../nomenclature/nomenclature"
import { ReactContext } from "../state/ReactContext"
import { Rule } from "../type"
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
        randomElementTitle={`Random ${rule.stateCount}-state rule`}
        randomElementTitle2={`Random rule (with up to six distinct states)`}
        extraOnPressEnter={act.focus("displayDiv")}
      />
    </Space.Compact>
  )
}
