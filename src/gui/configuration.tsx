import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Button } from "antd"
import { useContext } from "react"

import { nAryRule, parseRule, ruleName } from "../engine/rule"
import { ReactContext } from "../state/reactcontext"
import { OxInput, OxInputNumber } from "./component"

export let ConfigurationContent = () => {
    let { act, context } = useContext(ReactContext)
    let ul = (
        <ul>
            <li>
                {"Play state: "}
                <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    disabled={context.getState().play}
                    onClick={act.setPlay}
                />
                <Button
                    type="primary"
                    icon={<PauseCircleOutlined />}
                    disabled={!context.getState().play}
                    onClick={act.setPause}
                />
            </li>
            <li>
                Rule: <OxInput path="rule" present={ruleName} parse={parseRule} />
                <Button
                    icon={"🎲"}
                    onClick={() => {
                        context.updateState((state) => {
                            state.rule = nAryRule()
                        })
                    }}
                />
            </li>
            <li>
                Seed: <OxInput path="seed" />
                <Button
                    icon={"🎲"}
                    onClick={() => {
                        context.updateState((state) => {
                            state.seed = Math.random().toString(36).slice(2)
                        })
                    }}
                />
            </li>
            <li>
                Speed:
                <Button icon={"/2"} onClick={act.halfSpeed} />
                <Button icon={"-"} onClick={act.decreaseSpeed} />
                <OxInputNumber path="speed" />
                <Button icon={"+"} onClick={act.increaseSpeed} />
                <Button icon={"x2"} onClick={act.doubleSpeed} />
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
