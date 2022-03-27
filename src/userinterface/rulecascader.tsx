import { Cascader } from "antd"
import { DefaultOptionType } from "antd/lib/cascader"
import { useContext, useState } from "react"
import { interestingElementaryRuleSet, parseRule, ruleSet } from "../engine/rule"
import { ReactContext } from "../state/reactcontext"
import { limitLength } from "../util/limitLength"

let labelValue = (s: string) => ({ label: s, value: s })
let entryFrom = (label: string, ruleArray: number[]) => ({
    label,
    value: label,
    children: ruleArray.map((rule) => labelValue("b" + rule)),
})
let multiEntryFrom = (label: string, deepRuleArray: number[][]) => ({
    ...labelValue(label),
    children: deepRuleArray.map((ruleArray) => ({
        ...labelValue("" + ruleArray[0]),
        children: ruleArray.map((rule) => labelValue("b" + rule)),
    })),
})

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
        entryFrom("self-symmetric-self-color-complement (Single)", ruleSet.both),
        multiEntryFrom("self-color-complement (Pair of left-right symmetrics)", ruleSet.color),
        multiEntryFrom(
            "self-left-right-symmetric (Pair of the color complements)",
            ruleSet.leftright,
        ),
        multiEntryFrom("self-left-right-color (Pair)", ruleSet.leftrightcolor),
        multiEntryFrom("ordinary (Four rules)", ruleSet.four_a),
        multiEntryFrom("ordinary continued", ruleSet.four_b),
    ],
})

cascaderOptionSet.push({
    label: "Big Curated",
    value: "Big Curated",
    children: [
        "Cascade t4_880__842_232_460",
        "Right-triangles t7_281__352_072_754",
        "White-patches t7_567__294_825_569",
        "Chaotic-veins t6_079__678_157_526",
        "Purple q41__486_840_995__337_752_706__623_540_468__650_612_112",
        "Roots q64__476_493_094__943_827_905__561_183_734__743_354_260",
        "Bicolor-triangles q328__039_792_891__114_456_057__847_307_533__829_314_572",
        "Red-verticales h11__491_573_592__086_365_046__158_023_435__163_933_985__119_657_979__133_649_228__687_148_535__307_197_049__105_705_668__859_273_072__928_929_698__053_728_509__869_362_339__830_362_831__746_952_964__904_896_329__372_146_169__408_700_940",
    ].map((text) => {
        let [head, value] = text.split(" ")
        return {
            value,
            label: `${head} (${limitLength(value, 60 - head.length)})`,
        }
    }),
})

export let RuleCascader = () => {
    let { context } = useContext(ReactContext)

    // isOpen is managed to avoid the cascader closing when a value
    // is selected. This is desirable for deep cascaders
    let [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Cascader
                value={[]}
                style={{ maxWidth: "34px" }}
                options={"b30 b54 b60 b73 b90 b105 b106 b110 b150 b184".split(" ").map(labelValue)}
                onChange={(array) => {
                    if (!array) {
                        return
                    }
                    context.updateState((state) => {
                        state.rule = parseRule(array.slice(-1)[0])
                    })
                }}
            />
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
        </>
    )
}
