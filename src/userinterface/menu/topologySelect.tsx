import { Select } from "antd"
import { DefaultOptionType } from "antd/lib/select"
import { useContext, useState } from "react"

import { parseSideBorder, parseTopBorder } from "../../patternlang/parser"
import { ReactContext } from "../../state/ReactContext"

let entry = (label: string, value: string, ...options: DefaultOptionType[]): DefaultOptionType => {
  let result: DefaultOptionType = { label }
  if (options.length > 0) {
    result.options = options
  } else {
    if (value === "") {
      value = label
    }
    result.value = value
  }
  return result
}

export let topCascaderOptionSet = [
  entry(
    "Simple",
    "",
    entry("Random 50%", "([01])"),
    entry("Random 10%", "([0{9}1])"),
    entry("Impulse 1", "1(0)"),
  ),
  entry(
    "Random",
    "",
    entry("Random 90%", "([01{9}])"),
    entry("Step 25%-75%", "([0001])([0111])"),
    entry("Step 10%-90%", "([0{9}1])([01{9}])"),
  ),
  entry(
    "Impulse",
    "",
    entry("Step 0-1", "(0)(1)"),
    entry("Step 1-0", "(1)(0)"),
    entry("Impulse -1", "0(1)"),
    entry("Impulse 3", "11(0)"),
    entry("Impulse -3", "00(1)"),
    entry("Impulse 5", "101(0)"),
    entry("Impulse 7", "111(0)"),
  ),
  entry(
    "Pattern",
    "",
    entry("Rule 110 w14h7", "(1{5}000100110)"),
    entry("Word (1110)", "(1110)"),
    entry("Word (1000)", "(1000)"),
  ),
  entry(
    "Pattern with random",
    "",
    entry("Rule 73 starter (0[01])", "(0[01])"),
    entry("Rule 73 starter (1[01])", "(1[01])"),
  ),
]

export let sideCascaderOptionSet = [
  entry("All zero (0)", "(0)"),
  entry("All one (1)", "(1)"),
  entry("Random 50%", "([01])"),
  entry("Random 10%", "([0{9}1])"),
  entry("Random 90%", "([01{9}])"),
  entry("Alternate 0-1", "(01)"),
  entry("Alternate nine 0 one 1", "(0{9}1)"),
  entry("Alternate nine 1 one 0", "(1{9}0)"),
]

export let TopBorderSelect = () => {
  let { act, context } = useContext(ReactContext)

  let [isOpen, setIsOpen] = useState(false)

  return (
    <Select<string, { label: any }>
      value={""}
      open={isOpen}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
      style={{ maxWidth: "34px" }}
      dropdownStyle={{ minWidth: "200px" }}
      options={topCascaderOptionSet}
      onChange={(value, option) => {
        context.updateState((state) => {
          if (!Array.isArray(option)) {
            let lowerLabel = option.label.toLowerCase()
            if (lowerLabel.includes("random") || lowerLabel.includes("%")) {
              // Randomize the seed whenever the clicked option label contains
              // random values
              act.randomizeSeed(state)
            }
          }
          state.topology.genesis = parseTopBorder(value)
        })
      }}
    />
  )
}

export interface SideBorderCascaderProp {
  disabled?: boolean
  side: "borderLeft" | "borderRight"
}

export let SideBorderCascader = (prop: SideBorderCascaderProp) => {
  let { side, disabled } = prop
  let { context } = useContext(ReactContext)

  return (
    <Select
      disabled={disabled}
      value={""}
      style={{ maxWidth: "34px" }}
      dropdownStyle={{ minWidth: "200px" }}
      options={sideCascaderOptionSet}
      onChange={(value) => {
        context.updateState((state) => {
          state.topology[side] = parseSideBorder(value)
        })
      }}
    />
  )
}
