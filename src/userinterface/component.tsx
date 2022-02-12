import { Input, InputNumber } from "antd"
import { CSSProperties, useContext, useState } from "react"
import { ReactContext } from "../state/reactcontext"
import { State } from "../type"

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

export function OxInput(prop: OxInputProp) {
    let { disabled, path, present = (x) => x, parse = (y) => y, style = {} } = prop
    let { context } = useContext(ReactContext)
    let { piece, last } = readPath(path, context.getState())

    return (
        <Input
            style={{ width: "70%", ...style }}
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
    disabled?: boolean
    style?: CSSProperties
    present?: (x: any) => string
    parse?: (y: string) => any
}

export function OxEnterInput(prop: OxEnterInputProp) {
    let { disabled, path, present = (x) => x, parse = (y) => y, style = {} } = prop
    let { context } = useContext(ReactContext)
    let { piece, last } = readPath(path, context.getState())
    let [localValue, setValue] = useState(() => present(piece[last]))
    return (
        <Input
            style={{ width: "70%", ...style }}
            disabled={disabled}
            value={localValue}
            onChange={(ev) => {
                let v = ev.target.value
                setValue(v)
                try {
                    var p = parse(v)
                } catch {}
                if (present(p) === v) {
                    context.updateState((state) => {
                        piece[last] = parse(v)
                    })
                }
            }}
            onPressEnter={(ev) => {
                context.updateState((state) => {
                    let { piece, last } = readPath(path, state)
                    piece[last] = parse(localValue)
                    setValue(present(piece[last]))
                })
            }}
        ></Input>
    )
}

interface OxInputNumberProp {
    path: string
}

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
