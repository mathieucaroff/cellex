import { Cascader } from "antd"
import { DefaultOptionType } from "antd/lib/select"
import { useContext, useState } from "react"
import {
    colorComplement,
    elementaryRule,
    leftRightSymmetric,
    parseRule,
    ruleSet,
} from "../engine/rule"
import { ReactContext } from "../state/reactcontext"
import { deepEqual } from "../util/deepEqual"
import { limitLength } from "../util/limitLength"

let labelValue = (s: string) => ({ label: s, value: s })

// prettier-ignore
let interestingElementaryRuleSet = {
    "Famous":     [30, 90, 110],
    "Class 4":    [54, 106, 110],
    "XOR":        [60, 90, 105, 150],
    "Twinkling":  [15, 41, 45, 51, 62, 73, 94, 105],
    "Triangle":   [18, 22, 26, 30, 122, 126],
    "Primitives": [0, 255, 204, 51, 170, 240],
    "Curated":    [26, 73, 105],
}

let cascaderOptionSet: DefaultOptionType[] = Object.entries(interestingElementaryRuleSet).map(
    ([name, valueArray]) => {
        return {
            ...labelValue(name),
            children: valueArray.map((v) => labelValue("b" + v)),
        }
    },
)

cascaderOptionSet.unshift({
    ...labelValue("Grouped"),
    children: [
        {
            ...labelValue("No Other Symmetric"),
            children: ruleSet.both.map((rule) => labelValue("" + rule)),
        },
        {
            ...labelValue("Left-Right Symmetrics Only"),
            children: ruleSet.leftright.map((ruleLine) => ({
                ...labelValue("" + ruleLine[0]),
                children: ruleLine.map((r) => labelValue("" + r)),
            })),
        },
        {
            ...labelValue("Color Symmetrics Only"),
            children: ruleSet.color.map((ruleLine) => ({
                ...labelValue("" + ruleLine[0]),
                children: ruleLine.map((r) => labelValue("" + r)),
            })),
        },
        {
            ...labelValue("Four Symmetrics"),
            children: ruleSet.four.map((ruleLine) => ({
                ...labelValue("" + ruleLine[0]),
                children: ruleLine.map((r) => labelValue("" + r)),
            })),
        },
    ],
})

cascaderOptionSet.push({
    label: "Big Curated",
    value: "Big Curated",
    children: [
        "t7_567__294_825_569",
        "t7_281__352_072_754",
        "q41__486_840_995__337_752_706__623_540_468__650_612_112",
        "q64__476_493_094__943_827_905__561_183_734__743_354_260",
        "h486_480__349_299_697__886_565_208__915_144_207__295_787_333__480_353_164__685_404_250__288_717_898__820_344_212__359_944_691__682_338_113__239_664_283__085_015_338__217_166_462__590_636_066__117_734_409__868_306_436__652_026_182__764_426_949",
    ].map((value) => ({ value, label: limitLength(value, 60) })),
})

export let RuleCascader = () => {
    let { context } = useContext(ReactContext)

    let [isOpen, setIsOpen] = useState(false)

    return (
        <Cascader
            open={isOpen}
            value={[]}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            expandTrigger="hover"
            style={{ maxWidth: "34px" }}
            options={cascaderOptionSet}
            onChange={(array) => {
                if (!array) {
                    return
                }
                context.updateState((state) => {
                    state.rule = parseRule(array.slice(-1)[0])
                })
            }}
        />
    )
}
