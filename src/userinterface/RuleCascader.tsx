import { Cascader } from "antd"
import { DefaultOptionType } from "antd/lib/cascader"
import { useContext, useState } from "react"

import { interestingElementaryRuleSet, parseRule, ruleSet } from "../engine/rule"
import { ReactContext } from "../state/ReactContext"
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
    entryFrom("Single (fully-self-symmetric)", ruleSet.both),
    multiEntryFrom("Pair of left-right symmetrics (color-self-symmetric)", ruleSet.leftright),
    multiEntryFrom("Pair of color symmetrics (left-right-self-symmetric)", ruleSet.color),
    multiEntryFrom("Pair (left-right-color-self-symmetric)", ruleSet.leftrightcolor),
    multiEntryFrom("Group of four ordinary rules", ruleSet.four_a),
    multiEntryFrom("Group of four ordinary continuation", ruleSet.four_b),
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
    "Pattern-rich-triangles t3_819__888_392_777",
    "Semichaotic-b26 t33__469_693_293",
    "Purple q41__486_840_995__337_752_706__623_540_468__650_612_112",
    "Roots q64__476_493_094__943_827_905__561_183_734__743_354_260",
    "Tilted-roots q216__750_671_290__138_440_558__728_216_775__714_880_651",
    "Bicolor-triangles q328__039_792_891__114_456_057__847_307_533__829_314_572",
    "Red-verticales h11__491_573_592__086_365_046__158_023_435__163_933_985__119_657_979__133_649_228__687_148_535__307_197_049__105_705_668__859_273_072__928_929_698__053_728_509__869_362_339__830_362_831__746_952_964__904_896_329__372_146_169__408_700_940",
    "Multicolor-roots h1_203_737__139_276_230__542_812_354__126_529_582__380_453_724__455_370_923__393_470_746__443_225_720__674_170_267__252_494_725__231_895_793__748_249_018__817_437_938__597_956_359__028_898_052__878_724_025__514_733_817__646_152_967__953_314_310",
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
        {...{ title: "Interesting elementary rules" }}
        value={[]}
        style={{ maxWidth: "34px" }}
        options={"b30 b54 b60 b73 b90 b105 b106 b110 b150 b184".split(" ").map(labelValue)}
        onChange={(array) => {
          if (!array) {
            return
          }
          context.updateState((state) => {
            state.rule = parseRule(array.slice(-1)[0].toString())
          })
        }}
      />
      <Cascader
        {...{ title: "Elementary rules by category" }}
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
            state.rule = parseRule(array.slice(-1)[0].toString())
          })
        }}
      />
    </>
  )
}
