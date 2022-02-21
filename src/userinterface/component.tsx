import { Button, Input, InputNumber, Select } from "antd"
import Checkbox from "antd/lib/checkbox/Checkbox"
import { CSSProperties, useContext, useEffect, useState } from "react"
import { ReactContext } from "../state/reactcontext"
import { State } from "../type"

const { Option } = Select

function readPath(path: string, state: State) {
    let piece = state
    let nameList = path.split(".")
    let last = nameList.pop()!
    nameList.forEach((name) => {
        piece = piece[name]
    })
    return { piece, last }
}

interface OxInputProp {
    path: string
    disabled?: boolean
    style?: CSSProperties
    present?: (x: any) => string
    parse?: (y: string) => any
}

// OxInput an input tied to a value of the state
export function OxInput(prop: OxInputProp) {
    let { disabled, path, present = (x) => x, parse = (y) => y, style = {} } = prop
    let { context } = useContext(ReactContext)
    let { piece, last } = readPath(path, context.getState())

    return (
        <Input
            style={{ width: "73%", ...style }}
            disabled={disabled}
            value={present(piece[last])}
            onChange={(ev) => {
                context.updateState((state) => {
                    let { piece, last } = readPath(path, state)
                    piece[last] = parse(ev.target.value)
                })
            }}
        ></Input>
    )
}

interface OxEnterInputProp {
    path: string
    title?: string
    disabled?: boolean
    style?: CSSProperties
    present?: (x: any) => string
    parse?: (y: string) => any
    // randomiser is a way to get a random state value for the user
    randomiser?: () => any
}

// OxEnterInput an input which maps to the value of the path of the state
// It saves either when Enter is pressed or when the input matches perfectly
// the result of a round trip through the adaptor functions
export function OxEnterInput(prop: OxEnterInputProp) {
    let {
        path,
        title,
        disabled,
        present = (x) => x,
        parse = (y) => y,
        style = {},
        randomiser,
    } = prop

    let { context } = useContext(ReactContext)
    let { piece, last } = readPath(path, context.getState())
    let [localValue, setValue] = useState(() => present(piece[last]))
    let [isFocused, setIsFocused] = useState(false)

    let p: string
    useEffect(() => {
        if (!isFocused && localValue !== p) {
            setValue(p)
        }
    }, [isFocused || (p = present(piece[last]))])

    let randomElement = randomiser ? (
        <Button
            icon={"🎲"}
            onClick={() => {
                context.updateState((state) => {
                    let { piece, last } = readPath(path, state)
                    piece[last] = randomiser!()
                    setValue(present(piece[last]))
                })
            }}
        />
    ) : null

    return (
        <>
            <Input
                style={{ width: "74%", ...style }}
                title={title}
                disabled={disabled}
                value={localValue}
                onChange={(ev) => {
                    let v = ev.target.value
                    setValue(v)
                    let p: any
                    let pv: any
                    try {
                        p = parse(v)
                        pv = present(p)
                    } catch {}
                    if (pv === v) {
                        context.updateState((state) => {
                            let { piece, last } = readPath(path, state)
                            piece[last] = p
                        })
                    }
                }}
                onPressEnter={() => {
                    context.updateState((state) => {
                        let { piece, last } = readPath(path, state)
                        piece[last] = parse(localValue)
                        setValue(present(piece[last]))
                    })
                }}
                onBlur={() => setIsFocused(false)}
                onFocus={() => setIsFocused(true)}
            ></Input>
            {randomElement}
        </>
    )
}

interface OxInputNumberProp {
    path: string
}

// OxInputNumber an input tied to a numeric value of the state
export function OxInputNumber(prop: OxInputNumberProp) {
    let { path } = prop
    let { context } = useContext(ReactContext)
    let { piece, last } = readPath(path, context.getState())

    return (
        <InputNumber
            value={piece[last]}
            onChange={(value) => {
                context.updateState((state) => {
                    let { piece, last } = readPath(path, state)
                    piece[last] = value
                })
            }}
        ></InputNumber>
    )
}

interface OxSelectProp {
    path: string
    valueArray: string[]
    disabled?: boolean
}

// OxSelect a select input
export function OxSelect(prop: OxSelectProp) {
    let { path, disabled, valueArray } = prop
    let { context } = useContext(ReactContext)
    let { piece, last } = readPath(path, context.getState())

    return (
        <Select
            disabled={disabled}
            value={piece[last]}
            onChange={(value) => {
                context.updateState((state) => {
                    let { piece, last } = readPath(path, state)
                    piece[last] = value
                })
            }}
        >
            {valueArray.map((v) => (
                <Option value={v} key={v}>
                    {v}
                </Option>
            ))}
        </Select>
    )
}

interface OxButtonProp {
    path: string
    icon: React.ReactNode
    disabled?: boolean
    half?: boolean
    double?: boolean
}

// OxCheckbox a checkbox input tied to a boolean value of the state
export function OxButton(prop: OxButtonProp) {
    let { path, icon, disabled, half, double } = prop
    let { context } = useContext(ReactContext)

    let contribution: any = { icon, disabled }

    if (half || double) {
        let ratio = half ? 1 / 2 : 2
        contribution.onClick = (ev) => {
            context.updateState((state) => {
                let { piece, last } = readPath(path, state)
                piece[last] *= ratio
            })
        }
    }

    return <Button {...contribution} />
}

interface OxCheckboxProp {
    path: string
    disabled: boolean
}

// OxCheckbox a checkbox input tied to a boolean value of the state
export function OxCheckbox(prop: OxCheckboxProp) {
    let { path, disabled } = prop
    let { context } = useContext(ReactContext)
    let { piece, last } = readPath(path, context.getState())

    return (
        <Checkbox
            disabled={disabled}
            checked={piece[last]}
            onChange={(ev) => {
                context.updateState((state) => {
                    let { piece, last } = readPath(path, state)
                    piece[last] = ev.target.checked
                })
            }}
        ></Checkbox>
    )
}
