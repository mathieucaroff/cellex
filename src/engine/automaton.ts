import { Domain, TableCodeAutomaton, TableRuleAutomaton } from "../automatonType"
import { limitLength } from "../util/limitLength"
import { randomChoice, weightedRandomChoice } from "../util/randomChoice"

// prettier-ignore
export const interestingElementaryRuleSet = {
  "Interesting": [30, 54, 60, 73, 90, 105, 106, 110, 150, 184],
  "Triangle":    [18, 22, 26, 30, 122, 126, 146, 150, 154],
  "Twinkling":   [15, 41, 45, 51, 62, 73, 91, 94, 105],
  "XOR":         [60, 90, 105, 150],
  "Primitives":  [0, 255, 204, 51, 170, 240],
}

let set = interestingElementaryRuleSet
export const interestingElementaryRuleArray = ([] as number[]).concat(
  set.Interesting,
  set.Triangle,
  set.Twinkling.filter((x) => ![15, 51, 91, 94].includes(x)),
  set.XOR,
)

// elementaryRule produces a rule
export let elementaryRule = (ruleNumberValue: number): TableRuleAutomaton => {
  let transitionTable = Array.from({ length: 8 }, (_, k) => {
    return (ruleNumberValue & (1 << (7 - k))) >> (7 - k)
  })

  return {
    kind: "tableRule",
    dimension: 1,
    stateCount: 2,
    neighborhoodSize: 3,
    reversible: false,
    transitionTable,
  }
}

export let randomDomain = (): Domain => {
  let [neighborhoodSize, stateCount, r] = weightedRandomChoice([
    // weight, [neighborhoodSize, colorCount]
    [1, [3, 2, 0]], // elementary automaton
    [1, [3, 2, 1]],
    [1, [5, 2, 0]],
    [1, [5, 2, 1]],
    [1, [7, 2, 0]],
    [1, [7, 2, 1]],
    [1, [9, 2, 0]],
    [1, [9, 2, 1]],
    [1, [11, 2, 0]],
    [1, [11, 2, 1]],
    // [1, [12, 2, 0]],
    [1, [3, 3, 0]],
    [1, [5, 3, 0]],
    [1, [7, 3, 0]],
    [1, [3, 4, 0]],
    [1, [3, 4, 1]],
    [1, [5, 4, 0]],
    [1, [5, 4, 1]],
    [1, [3, 5, 0]],
    [1, [5, 5, 0]],
    [1, [3, 6, 0]],
    // [1, [3, 7, 0]],
    // [1, [3, 8, 0]],
    // [1, [3, 9, 0]],
    // [1, [3, 10, 0]],
    // [1, [3, 11, 0]],
    // [1, [3, 12, 0]],
    // [1, [3, 13, 0]],
    // [1, [3, 14, 0]],
    // [1, [3, 15, 0]],
    // [1, [3, 16, 0]],
    // [1, [2, 16, 0]],
    // ...
    // [1, [2, 64, 0]],
  ])
  return { dimension: 1, reversible: !!r, neighborhoodSize, stateCount }
}

export let randomTransitionTable = (domain: Omit<Domain, "dimension">) => {
  let { neighborhoodSize, stateCount } = domain
  let count = BigInt(stateCount)
  let transition = 0n
  let transitionTable = Array.from({ length: stateCount ** neighborhoodSize }, () => {
    let random = Math.floor(stateCount * Math.random())
    transition *= count
    transition += BigInt(random)
    return random
  })

  return {
    transitionTable,
    transitionNumber: transition,
  }
}

export let randomRule = () => {
  return randomRuleFromDomain(randomDomain())
}

export let randomRuleFromDomain = (domain: Domain): TableRuleAutomaton => {
  let { dimension: _, ...d } = domain
  return {
    kind: "tableRule",
    dimension: 1,
    neighborhoodSize: d.neighborhoodSize,
    stateCount: d.stateCount,
    reversible: d.reversible,
    transitionTable: randomTransitionTable(d).transitionTable,
  }
}

export let randomGoodRule = (): TableRuleAutomaton => {
  if (Math.random() < 0.6) {
    return elementaryRule(randomChoice(interestingElementaryRuleArray))
  }
  return randomRule()
}

export let randomGoodAutomatonFromDomain = (domain: Domain): TableRuleAutomaton => {
  if (
    domain.neighborhoodSize === 3 &&
    domain.stateCount === 2 &&
    !domain.reversible &&
    Math.random() < 0.6
  ) {
    return elementaryRule(randomChoice(interestingElementaryRuleArray))
  }
  return randomRuleFromDomain(domain)
}

export function computeAnyTransitionTable(
  stateCount: number,
  length: number,
  transitionNumber: bigint,
) {
  let colorCount = BigInt(stateCount)

  let transitionTable = Array.from({ length }, () => {
    let mod = transitionNumber % colorCount
    transitionNumber = (transitionNumber - mod) / colorCount
    return Number(mod)
  }).reverse()

  return transitionTable
}

export function computeRuleTransitionTable(
  neighborhoodSize: number,
  stateCount: number,
  transitionNumber: bigint,
) {
  return computeAnyTransitionTable(stateCount, stateCount ** neighborhoodSize, transitionNumber)
}

export function computeCodeTransitionTable(
  neighborhoodSize: number,
  stateCount: number,
  transitionNumber: bigint,
) {
  return computeAnyTransitionTable(
    stateCount,
    (stateCount - 1) * neighborhoodSize + 1,
    transitionNumber,
  )
}

export let computeTransitionNumber = (
  automaton: TableRuleAutomaton | TableCodeAutomaton,
): BigInt => {
  let value = 0n // bigint
  let stateCount = BigInt(automaton.stateCount)
  automaton.transitionTable.forEach((v) => {
    value += BigInt(v)
    value *= stateCount
  })
  value /= stateCount
  return value
}

/** left-right symmetric of the given rule. It supports arbitrary rules. */
export let leftRightSymmetric = (rule: TableRuleAutomaton): TableRuleAutomaton => {
  return {
    ...rule,
    transitionTable: Array.from({ length: rule.transitionTable.length }, (_, k) => {
      let text = k.toString(rule.stateCount).padStart(rule.neighborhoodSize, "0")
      let reversedText = text.split("").reverse().join("")
      let m = Number.parseInt(reversedText, rule.stateCount)
      return rule.transitionTable[m]
    }),
  }
}

/** color complement of the given rule or code. */
export let colorComplement = <T extends TableRuleAutomaton | TableCodeAutomaton>(
  automaton: T,
): T => {
  return {
    ...automaton,
    transitionTable: automaton.transitionTable.map((c) => automaton.stateCount - 1 - c).reverse(),
  }
}

export let baseComplement = (rule: TableRuleAutomaton): TableRuleAutomaton => {
  return {
    ...rule,
    transitionTable: rule.transitionTable.map((c) => rule.stateCount - 1 - c),
  }
}

export let baseDigitOrderReverse = (rule: TableRuleAutomaton): TableRuleAutomaton => {
  return {
    ...rule,
    transitionTable: [...rule.transitionTable].reverse(),
  }
}

/** Generate the elementary automata rule set, classifying each of them according to their symmetries */
function generateRuleSet() {
  let ruleGroup = {
    both: [] as number[],
    color: [] as number[][],
    leftright: [] as number[][],
    leftrightcolor: [] as number[][],
    four: [] as number[][],
    fourA: [] as number[][],
    fourB: [] as number[][],
  }

  Array.from({ length: 256 }, (_, value) => {
    let rule = elementaryRule(value)

    let complementRule = colorComplement(rule)
    let complement = Number(computeTransitionNumber(complementRule))
    let symmetric = Number(computeTransitionNumber(leftRightSymmetric(rule)))
    let both = Number(computeTransitionNumber(leftRightSymmetric(complementRule)))

    if (value === symmetric && value === complement) {
      ruleGroup.both.push(value)
    } else if (value === complement && value !== symmetric) {
      if (value < symmetric) {
        ruleGroup.leftright.push([value, symmetric])
      }
    } else if (value !== complement && value === symmetric) {
      if (value < complement) {
        ruleGroup.color.push([value, complement])
      }
    } else if (value !== complement && value !== symmetric && value === both) {
      if (value < complement) {
        ruleGroup.leftrightcolor.push([value, complement])
      }
    } else if (value < complement && value < symmetric && value < both) {
      let entry = [value, symmetric, complement, both]
      ruleGroup.four.push(entry)
      if (value <= 41) {
        ruleGroup.fourA.push(entry)
      } else {
        ruleGroup.fourB.push(entry)
      }
    }
  })

  return ruleGroup
}

export const ruleSet = generateRuleSet()
;(globalThis as any).ruleSet = ruleSet
;(globalThis as any).interestingElementaryRuleArray = interestingElementaryRuleArray

function parseCuratedCode(text) {
  let [code, ...infoArray] = text.split(" ")
  let info = infoArray.join(" ")
  let label = info.length > 0 ? `${code} (${info})` : code
  return {
    value: code,
    label,
    shorterLabel: code,
  }
}

export const curatedNs3AutomatonArray = [
  "Cascade 3c,r4_880__842_232_460",
  "Right-triangles 3c,r7_281__352_072_754",
  "White-patches 3c,r7_567__294_825_569",
  "Sierpinski-triangle 3c,r2_093__255_393_004",
  "Chaotic-veins 3c,r6_079__678_157_526",
  "Pattern-rich-triangles 3c,r3_819__888_392_777",
  "Semichaotic-e26 3c,r33__469_693_293",
  "Moving-to-the-right 3c,r5_599__476_095_748",
  "Moving-to-the-right-two 3c,r109__077_282_699",
  "Purple 4c,r41__486_840_995__337_752_706__623_540_468__650_612_112",
  "Roots 4c,r64__476_493_094__943_827_905__561_183_734__743_354_260",
  "Tilted-roots 4c,r216__750_671_290__138_440_558__728_216_775__714_880_651",
  "Bicolor-triangles 4c,r328__039_792_891__114_456_057__847_307_533__829_314_572",
  "Multicolor-triangles 4c,r194__088_988_058__375_336_366__952_469_452__072_626_888",
  "Pastel-mix 5c,r1_985_630__373_654_014__946_103_149__023_583_075__826_689_150__467_823_501__314_408_632__866_497_502__663_674_710__651_870_710",
  "Red-verticales 6c,r11__491_573_592__086_365_046__158_023_435__163_933_985__119_657_979__133_649_228__687_148_535__307_197_049__105_705_668__859_273_072__928_929_698__053_728_509__869_362_339__830_362_831__746_952_964__904_896_329__372_146_169__408_700_940",
  "Multicolor-roots 6c,r1_203_737__139_276_230__542_812_354__126_529_582__380_453_724__455_370_923__393_470_746__443_225_720__674_170_267__252_494_725__231_895_793__748_249_018__817_437_938__597_956_359__028_898_052__878_724_025__514_733_817__646_152_967__953_314_310",
].map((text) => {
  let [head, value] = text.split(" ")
  return {
    value,
    label: `${head} (${limitLength(value, 30)})`,
    shorterLabel: `${head} (${limitLength(value, 28 - head.length)})`,
  }
})

export const curated3ColorCodeArray = [
  "3c,c153 looks like rule 54",
  "3c,c228 looks like rule 54",
  "3c,c321 has rule 73 columns",
  "3c,c408 is like rule 73",
  "3c,c426 is like rule 73 as well",
  "3c,c555 has blue rootlings!",
  "3c,c963 looks very good and is interesting",
  "3c,c1_029 has orange patches",
].map((text) => {
  let [code, ...infoArray] = text.split(" ")
  let info = infoArray.join(" ")
  let label = info.length > 0 ? `${code} (${info})` : code
  let shorterLabel = info.length > 0 ? `${code} (${limitLength(info, 24)})` : code
  return {
    value: code,
    label,
    shorterLabel,
  }
})

export const extraCurated3ColorCodeArray = [
  "3c,c43",
  "3c,c69",
  "3c,c83",
  "3c,c88",
  "3c,c136",
  "3c,c165 looks like rule 73, but it's even more beautiful",
  "3c,c173",
  "3c,c174 and 3c,c190 have walls",
  "3c,c231 looks like rule 54, but the electrons are visible",
  "3c,c262 has beautiful roots",
  "3c,c266 has some blue columns and some dark orange ones",
  "3c,c320 also does.",
  "3c,c379 looks like code 136",
  "3c,c462 looks good",
  "3c,c622 is similar to 3c,c136 but it converges faster",
  "3c,c806 is funny",
  "3c,c861 is beautiful and rather interesting",
].map((text) => {
  let [code, ...infoArray] = text.split(" ")
  let info = infoArray.join(" ")
  let label = info.length > 0 ? `${code} (${info})` : code
  return {
    value: code,
    label,
    shorterLabel: code,
  }
})
