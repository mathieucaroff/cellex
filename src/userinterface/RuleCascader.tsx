import { Cascader, Select } from "antd"
import { DefaultOptionType } from "antd/lib/select"
import { useContext, useState } from "react"

import { interestingElementaryRuleSet, ruleSet } from "../engine/rule"
import { parseNomenclature } from "../nomenclature/nomenclature"
import { ReactContext } from "../state/ReactContext"
import { labelValue } from "../util/labelValue"
import { limitLength } from "../util/limitLength"

let cascaderOptionSet: DefaultOptionType[] = Object.entries(interestingElementaryRuleSet).map(
  ([name, valueArray]) => {
    return {
      ...labelValue(name),
      children: valueArray.map((v) => labelValue("e" + v)),
    }
  },
)

// compute and add groupedOptions to cascaderOptionSet
let entryFrom = (label: string, ruleArray: number[]) => ({
  label,
  value: label,
  children: ruleArray.map((rule) => labelValue("e" + rule)),
})
let multiEntryFrom = (label: string, deepRuleArray: number[][]) => ({
  ...labelValue(label),
  children: deepRuleArray.map((ruleArray) => ({
    ...labelValue("" + ruleArray[0]),
    children: ruleArray.map((rule) => labelValue("e" + rule)),
  })),
})

const groupedOptions = {
  ...labelValue("Grouped"),
  children: [
    entryFrom("Single (fully-self-symmetric)", ruleSet.both),
    multiEntryFrom("Pair of left-right symmetrics (color-self-symmetric)", ruleSet.leftright),
    multiEntryFrom("Pair of color symmetrics (left-right-self-symmetric)", ruleSet.color),
    multiEntryFrom("Pair (left-right-color-self-symmetric)", ruleSet.leftrightcolor),
    multiEntryFrom("Group of four ordinary rules", ruleSet.fourA),
    multiEntryFrom("Group of four ordinary continuation", ruleSet.fourB),
  ],
}

cascaderOptionSet.unshift(groupedOptions)

export const curatedLargeAutomatonArray = [
  "Cascade 3c,r4_880__842_232_460",
  "Right-triangles 3c,r7_281__352_072_754",
  "White-patches 3c,r7_567__294_825_569",
  "Chaotic-veins 3c,r6_079__678_157_526",
  "Pattern-rich-triangles 3c,r3_819__888_392_777",
  "Semichaotic-e26 3c,r33__469_693_293",
  "Purple 4c,r41__486_840_995__337_752_706__623_540_468__650_612_112",
  "Roots 4c,r64__476_493_094__943_827_905__561_183_734__743_354_260",
  "Tilted-roots 4c,r216__750_671_290__138_440_558__728_216_775__714_880_651",
  "Bicolor-triangles 4c,r328__039_792_891__114_456_057__847_307_533__829_314_572",
  "Multicolor-triangles 4c,r194__088_988_058__375_336_366__952_469_452__072_626_888",
  "Red-verticales 6c,r11__491_573_592__086_365_046__158_023_435__163_933_985__119_657_979__133_649_228__687_148_535__307_197_049__105_705_668__859_273_072__928_929_698__053_728_509__869_362_339__830_362_831__746_952_964__904_896_329__372_146_169__408_700_940",
  "Multicolor-roots 6c,r1_203_737__139_276_230__542_812_354__126_529_582__380_453_724__455_370_923__393_470_746__443_225_720__674_170_267__252_494_725__231_895_793__748_249_018__817_437_938__597_956_359__028_898_052__878_724_025__514_733_817__646_152_967__953_314_310",
].map((text) => {
  let [head, value] = text.split(" ")
  return {
    value,
    label: `${head} (${limitLength(value, 60 - head.length)})`,
    shorterLabel: `${head} (${limitLength(value, 28 - head.length)})`,
  }
})

cascaderOptionSet.push({
  label: "Curated Large",
  value: "Curated Large",
  children: curatedLargeAutomatonArray,
})

export let RuleCascader = () => {
  let { context } = useContext(ReactContext)

  // isOpen is managed to avoid the cascader closing when a value
  // is selected. This is desirable for deep cascaders
  let [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Select
        title="Select a domain"
        value=""
        style={{ width: "34px" }}
        dropdownStyle={{ minWidth: "340px", height: "" }}
        options={generateSupportedDomainArray()}
        listHeight={400}
        onChange={(value) => {
          context.updateState((state) => {
            state.rule = parseNomenclature(value)
          })
        }}
      />
      <Select
        title="Interesting elementary rules"
        value=""
        style={{ width: "34px" }}
        dropdownStyle={{ minWidth: "110px", height: "" }}
        options={[
          {
            label: "Interesting elementary rules",
            options: "e30 e54 e60 e73 e90 e105 e106 e110 e150 e184".split(" ").map(labelValue),
          },
        ]}
        listHeight={400}
        onChange={(value) => {
          context.updateState((state) => {
            state.rule = parseNomenclature(value)
          })
        }}
      />
      <Cascader
        title="Elementary rules by category"
        open={isOpen}
        value={[]}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        style={{ maxWidth: "34px" }}
        options={cascaderOptionSet}
        onChange={(array) => {
          context.updateState((state) => {
            state.rule = parseNomenclature(array.slice(-1)[0])
          })
        }}
      />
    </>
  )
}

function generateSupportedDomainArray() {
  const labelValue = (s: string) => ({ label: s, value: `${s}, rule 1` })

  const domainArray: DefaultOptionType[] = []

  let degenerateArray: DefaultOptionType[]

  // iterate on the neighborhood sizes
  Array.from({ length: 12 }, (_, ns) => {
    /* prettier-ignore */
    if (
      false
      || ns < 1 || ns > 11 // ns out of bound
      || ns % 2 === 0 // ns must be odd
    ) {
      return
    }

    const subArray: DefaultOptionType[] = []
    Array.from({ length: 8 }, (_, c) => {
      /* prettier-ignore */
      if (
        false
        || c < 2 || c > 7 // c out of bound
        || c ** ns > 4096 // rule too big
      ) {
        return
      }
      subArray.push(labelValue(`neighborhood size ${ns}, ${c} colors`))
    })
    if (ns === 1) {
      degenerateArray = subArray
    } else {
      let suffix = ns > 3 ? ` of neighborhood size ${ns}` : ""
      domainArray.push({ label: `Domains${suffix}`, options: subArray })
    }
  })

  domainArray.push({ label: "Degenerate domains", options: degenerateArray })

  return domainArray
}
