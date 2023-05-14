import { Space } from "antd"
import { useContext } from "react"

import { nAryRule, parseRule, ruleName } from "../engine/rule"
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
        present={ruleName}
        parse={parseRule}
        randomizer={() => nAryRule(rule.stateCount)}
        randomizer2={nAryRule}
        randomElementTitle={`Random ${rule.stateCount}-state rule`}
        randomElementTitle2={`Random rule (with up to six distinct states)`}
        extraOnPressEnter={act.focus("displayDiv")}
      />
    </Space.Compact>
  )
}
