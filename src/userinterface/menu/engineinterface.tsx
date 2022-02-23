import { Button } from "antd"
import { useContext } from "react"

import { ReactContext } from "../../state/reactcontext"
import { OxButton, OxInput, OxInputNumber } from "../component"

export let EngineInterface = () => {
    let { context } = useContext(ReactContext)
    let ul = (
        <ul>
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
                Simulation width: <OxButton half icon={"/2"} path="topology.width" />
                <OxInputNumber path="topology.width" />
                <OxButton double icon={"x2"} path="topology.width" />
                <br />
                <Button
                    onClick={context.action((state) => {
                        state.topology.width = state.canvasSize.width
                    })}
                >
                    Copy from canvas
                </Button>
                <Button
                    onClick={context.action((state) => {
                        state.canvasSize.width = state.topology.width
                    })}
                >
                    Write to canvas
                </Button>
            </li>
        </ul>
    )
    return <div>{ul}</div>
}
