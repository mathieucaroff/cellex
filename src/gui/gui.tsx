import { PlayCircleOutlined, PauseCircleOutlined } from "@ant-design/icons"

import { Button, Input, InputNumber, Popconfirm, Popover } from "antd"
import { useContext } from "react"
import { Context } from "../state/context"
import { ReactContext } from "../state/reactcontext"
import { State } from "../type"

interface OxInputNumberProp {
    path: string
}

function readPath(path: string, state: State) {
    let piece = state
    let nameList = path.split(".")
    let last = nameList.pop()!
    nameList.forEach((name) => {
        piece = piece[name]
    })
    return { piece, last }
}

function OxInput(prop: OxInputNumberProp) {
    let { path } = prop
    let context = useContext(ReactContext)
    let { piece, last } = readPath(path, context.getState())

    return (
        <Input
            value={piece[last]}
            onChange={(value) => {
                context.updateState((state) => {
                    let { piece, last } = readPath(path, state)
                    piece[last] = value
                })
            }}
        ></Input>
    )
}

function OxInputNumber(prop: OxInputNumberProp) {
    let { path } = prop
    let context = useContext(ReactContext)
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

interface ConfigurationContentProp {}

let ConfigurationContent = (prop: ConfigurationContentProp) => {
    let context = useContext(ReactContext)
    let ul = (
        <ul>
            <li>
                {"Play state: "}
                <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    disabled={context.getState().play}
                    onClick={() => {
                        context.updateState((state) => (state.play = true))
                    }}
                />
                <Button
                    type="primary"
                    icon={<PauseCircleOutlined />}
                    disabled={!context.getState().play}
                    onClick={() => {
                        context.updateState((state) => (state.play = false))
                    }}
                />
            </li>
            <li>
                Seed: <OxInput path="seed" />
            </li>
            <li>
                Speed: <OxInputNumber path="speed" />
            </li>
            <li>
                Space position: <OxInputNumber path="posS" />
            </li>
            <li>
                Time position: <OxInputNumber path="posT" />
            </li>
            <li>
                Simulation width: <OxInputNumber path="topology.width" />
            </li>
            <li>
                Canvas width: <OxInputNumber path="canvasSize.width" />
            </li>
            <li>
                Canvas height: <OxInputNumber path="canvasSize.height" />
            </li>
        </ul>
    )
    return <div>{ul}</div>
}

interface ConfigurationPopoverButtonProp {
    context: Context
}

export let ConfigurationPopoverButton = (prop: ConfigurationPopoverButtonProp) => {
    let { context } = prop
    return (
        <ReactContext.Provider value={context}>
            <Popover
                placement="bottomRight"
                title={"Configuration"}
                content={<ConfigurationContent />}
                trigger="click"
            >
                <Button>Configuration</Button>
            </Popover>
        </ReactContext.Provider>
    )
}
