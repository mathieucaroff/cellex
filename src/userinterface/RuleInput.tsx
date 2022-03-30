import { Input } from "antd"
import { useContext } from "react"
import { nAryRule, parseRule, ruleName } from "../engine/rule"
import { ReactContext } from "../state/ReactContext"
import { OxEnterInput } from "./component"
import { RuleCascader } from "./RuleCascader"

export let RuleInput = () => {
    let { context } = useContext(ReactContext)
    let { rule } = context.getState()

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
