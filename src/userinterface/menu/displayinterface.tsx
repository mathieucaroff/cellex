import { Button } from "antd"
import { useContext } from "react"

import { ReactContext } from "../../state/reactcontext"
import { OxButton, OxInput, OxInputNumber } from "../component"

export let DisplayInterface = () => {
    let { act, context } = useContext(ReactContext)
    let ul = (
        <ul>
            <li>
                Speed: <Button icon={"/2"} onClick={act.halfSpeed} />
                <Button icon={"-"} onClick={act.decreaseSpeed} />
                <OxInputNumber path="speed" />
                <Button icon={"+"} onClick={act.increaseSpeed} />
                <Button icon={"x2"} onClick={act.doubleSpeed} />
            </li>
            <li>
                Zoom: <Button icon={"/2"} onClick={act.halfZoom} />
                <Button icon={"-"} onClick={act.decreaseZoom} />
                <OxInputNumber path="zoom" />
                <Button icon={"+"} onClick={act.increaseZoom} />
                <Button icon={"x2"} onClick={act.doubleZoom} />
            </li>
            <li>
                Space position: <OxInputNumber path="posS" />
            </li>
            <li>
                Time position: <OxInputNumber path="posT" />
            </li>
            <li>
                Canvas width: <OxButton half icon={"/2"} path="canvasSize.width" />
                <OxInputNumber path="canvasSize.width" />
                <OxButton double icon={"x2"} path="canvasSize.width" />
                <br />
                <Button
                    onClick={context.action((state) => {
                        state.canvasSize.width = state.topology.width
                    })}
                >
                    Copy from simulation
                </Button>
                <Button
                    onClick={context.action((state) => {
                        state.topology.width = state.canvasSize.width
                    })}
                >
                    Write to simulation
                </Button>
            </li>
            <li>
                Zoom c. width: <OxButton half icon={"/2"} path="zoomCanvasSize.width" />
                <OxInputNumber path="zoomCanvasSize.width" />
                <OxButton double icon={"x2"} path="zoomCanvasSize.width" />
            </li>
            <li>
                Canvas height: <OxButton half icon={"/2"} path="canvasSize.height" />
                <OxInputNumber path="canvasSize.height" />
                <OxButton double icon={"x2"} path="canvasSize.height" />
            </li>
            <li>
                Zoom c. height: <OxButton half icon={"/2"} path="zoomCanvasSize.height" />
                <OxInputNumber path="zoomCanvasSize.height" />
                <OxButton double icon={"x2"} path="zoomCanvasSize.height" />
            </li>
        </ul>
    )
    return <div>{ul}</div>
}
