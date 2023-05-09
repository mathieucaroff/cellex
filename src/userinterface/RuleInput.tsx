import { Input } from "antd"

import { nAryRule, parseRule, ruleName } from "../engine/rule"
import { RuleCascader } from "./RuleCascader"
import { OxEnterInput } from "./component"
import { useStateSelection } from "./hooks"

export let RuleInput = () => {
  let rule = useStateSelection(({ rule }) => rule)

  return (
    <Input.Group compact>
      <RuleCascader />
      <OxEnterInput
        path="rule"
        title="set rule"
        style={{ width: "initial" }}
        present={ruleName}
        parse={parseRule}
        randomizer={() => nAryRule(rule.stateCount)}
        randomizer2={nAryRule}
        randomElementTitle={`Random ${rule.stateCount}-state rule`}
        randomElementTitle2={`Random rule (with up to six distinct states)`}
      />
    </Input.Group>
  )
}
