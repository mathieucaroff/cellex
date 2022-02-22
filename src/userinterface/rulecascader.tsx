import { Cascader } from "antd"
import { DefaultOptionType } from "antd/lib/cascader"
import { useContext, useState } from "react"
import { parseRule, ruleSet } from "../engine/rule"
import { ReactContext } from "../state/reactcontext"
import { limitLength } from "../util/limitLength"

let labelValue = (s: string) => ({ label: s, value: s })

// prettier-ignore
let interestingElementaryRuleSet = {
    "Famous":     [30, 90, 110],
    "Class 4":    [54, 106, 110],
    "XOR":        [60, 90, 105, 150],
    "Triangle":   [18, 22, 26, 30, 122, 126],
    "Primitives": [0, 255, 204, 51, 170, 240],
    "Twinkling":  [15, 41, 45, 51, 62, 73, 94, 105],
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
            ...labelValue("self-symmetric-self-color-complement (Single)"),
            children: ruleSet.both.map((rule) => labelValue("b" + rule)),
        },
        {
            ...labelValue("self-color-complement (Pair of left-right symmetrics)"),
            children: ruleSet.leftright.map((ruleLine) => ({
                ...labelValue("" + ruleLine[0]),
                children: ruleLine.map((r) => labelValue("b" + r)),
            })),
        },
        {
            ...labelValue("self-left-right-symmetric (Pair of the color complements)"),
            children: ruleSet.color.map((ruleLine) => ({
                ...labelValue("" + ruleLine[0]),
                children: ruleLine.map((r) => labelValue("b" + r)),
            })),
        },
        {
            ...labelValue("ordinary (Four rules)"),
            children: ruleSet.four.map((ruleLine) => ({
                ...labelValue("" + ruleLine[0]),
                children: ruleLine.map((r) => labelValue("b" + r)),
            })),
        },
    ],
})

cascaderOptionSet.unshift(..."b30 b54 b60 b73 b90 b105 b106 b110 b150".split(" ").map(labelValue))

cascaderOptionSet.push({
    label: "Big Curated",
    value: "Big Curated",
    children: [
        "t4_880__842_232_460",
        "t7_281__352_072_754",
        "t7_567__294_825_569",
        "q41__486_840_995__337_752_706__623_540_468__650_612_112",
        "q64__476_493_094__943_827_905__561_183_734__743_354_260",
        "p1_431_113__090_193_819__800_960_113__032_595_869__687_956_897__173_049_813__808_700_582__892_173_027__171_367_721__213_020_185",
        "h11__491_573_592__086_365_046__158_023_435__163_933_985__119_657_979__133_649_228__687_148_535__307_197_049__105_705_668__859_273_072__928_929_698__053_728_509__869_362_339__830_362_831__746_952_964__904_896_329__372_146_169__408_700_940",
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
