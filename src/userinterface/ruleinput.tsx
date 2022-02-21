import { Input } from "antd"
import { nAryRule, parseRule, ruleName } from "../engine/rule"
import { OxEnterInput } from "./component"
import { RuleCascader } from "./rulecascader"

export let RuleInput = () => {
    return (
        <Input.Group compact>
            <RuleCascader />
            <OxEnterInput
                path="rule"
                style={{ width: "initial" }}
                title="set rule"
                present={ruleName}
                parse={parseRule}
                randomiser={nAryRule}
            />
        </Input.Group>
    )
}
