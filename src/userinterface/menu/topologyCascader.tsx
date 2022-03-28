import { Cascader } from "antd"
import { DefaultOptionType } from "antd/lib/cascader"
import { useContext, useState } from "react"
import { parseSideBorder, parseTopBorder } from "../../patternlang/parser"
import { ReactContext } from "../../state/ReactContext"

let entry = (label: string, value: string, ...children: DefaultOptionType[]): DefaultOptionType => {
    if (value === "") {
        value = label
    }
    let result: DefaultOptionType = { label, value }
    if (children.length > 0) {
        result.children = children
    }
    return result
}

export let topCascaderOptionSet = [
    entry(
        "Impulse",
        "",
        entry("Step 0-1", "(0)(1)"),
        entry("Step 1-0", "(1)(0)"),
        entry("Impulse 1", "(0)1(0)"),
        entry("Impulse 3", "(0)11(0)"),
        entry("Impulse 5", "(0)101(0)"),
        entry("Impulse 7", "(0)111(0)"),
        entry("Impulse 9", "(0)1001(0)"),
        entry("Impulse 11", "(0)1011(0)"),
        entry("Impulse 13", "(0)1101(0)"),
        entry("Impulse 15", "(0)1111(0)"),
    ),
    entry(
        "Random",
        "",
        entry("Random 50%", "([01])([01])"),
        entry("Random 10%", "([0{9}1])([0{9}1])"),
        entry("Random 90%", "([01{9}])([01{9}])"),
        entry("Step 10%-90%", "([0{9}1])([01{9}])"),
    ),
    entry(
        "Pattern",
        "",
        entry("Rule 110 w14h7", "(1{5}000100110)(1{5}000100110)"),
        entry("Word (1110)", "(1110)(1110)"),
        entry("Word (1000)", "(1000)(1000)"),
    ),
    entry(
        "Pattern with random",
        "",
        entry("Rule 73 starter (0[01])", "(0[01])(0[01])"),
        entry("Rule 73 starter (1[01])", "(1[01])(1[01])"),
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

export let TopBorderCascader = () => {
    let { context } = useContext(ReactContext)

    let [isOpen, setIsOpen] = useState(false)

    return (
        <Cascader
            open={isOpen}
            value={[]}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setIsOpen(false)}
            style={{ maxWidth: "34px" }}
            options={topCascaderOptionSet}
            onChange={(array) => {
                if (!array) {
                    return
                }
                context.updateState((state) => {
                    state.topology.genesis = parseTopBorder(array.slice(-1)[0])
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
        <Cascader
            disabled={disabled}
            value={[]}
            style={{ maxWidth: "34px" }}
            options={sideCascaderOptionSet}
            onChange={(array) => {
                if (!array) {
                    return
                }
                context.updateState((state) => {
                    state.topology[side] = parseSideBorder(array.slice(-1)[0])
                })
            }}
        />
    )
}
