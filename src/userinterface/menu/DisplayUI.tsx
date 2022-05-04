import { Button, Checkbox, Divider } from "antd"
import { useContext, useState } from "react"

import { ReactContext } from "../../state/ReactContext"
import { OxButton, OxInputNumber } from "../component"

export let DisplayUI = () => {
    let { act, context } = useContext(ReactContext)
    let { showZoomCanvasBoundary, redraw } = context.getState()

    let [affectSimulationWidth, setAffectSimulationWidth] = useState(true)

    let setMainCanvasWidthTo = (ratio: number) => () => {
        context.updateState((state) => {
            let fullwidth = Math.ceil(window.innerWidth - 56)
            let width = Math.ceil((fullwidth * ratio) / 2) * 2

            if (affectSimulationWidth) {
                state.topology.width = width
            }
            state.canvasSize.width = width
            state.canvasSize.fullwidth = fullwidth
        })
    }

    let presetControlElement = (
        <ul>
            Main / Zoom canvas ratio
            <li>
                <Button onClick={setMainCanvasWidthTo(0.97)}>Main only (97% main 3% zoom)</Button>
            </li>
            <li>
                <Button onClick={setMainCanvasWidthTo(0.5)}>
                    Half of each (50% main 50% zoom)
                </Button>
            </li>
            <li>
                <Button onClick={setMainCanvasWidthTo(0.2)}>Zoomed up (20% main 80% zoom)</Button>
            </li>
            <li>
                <Checkbox
                    checked={affectSimulationWidth}
                    onChange={() => {
                        setAffectSimulationWidth(!affectSimulationWidth)
                    }}
                >
                    Also set simulation width
                </Checkbox>
            </li>
        </ul>
    )
    let fineGrainControlElement = (
        <ul>
            <li>
                Speed: <Button icon={"/2"} onClick={() => act.halfSpeed()} />
                <Button icon={"-"} onClick={() => act.decreaseSpeed()} />
                <OxInputNumber path="speed" />
                <Button icon={"+"} onClick={() => act.increaseSpeed()} />
                <Button icon={"x2"} onClick={() => act.doubleSpeed()} />
            </li>
            <li>
                🔎 Zoom: <Button icon={"/2"} onClick={() => act.halfZoom()} />
                <Button icon={"-"} onClick={() => act.decreaseZoom()} />
                <OxInputNumber path="zoom" />
                <Button icon={"+"} onClick={() => act.increaseZoom()} />
                <Button icon={"x2"} onClick={() => act.doubleZoom()} />
            </li>
            <li>
                ⌖Space position: <OxInputNumber path="posS" />
            </li>
            <li>
                ⌖Time position (generation): <OxInputNumber path="posT" />
                <Button onClick={() => act.gotoTop()}>Reset</Button>
            </li>
            <li>
                ⟷Canvas width: <OxButton half icon={"/2"} path="canvasSize.width" />
                <OxInputNumber path="canvasSize.width" />
                <OxButton double icon={"x2"} path="canvasSize.width" />
                <br />
                <Button
                    onClick={context.action((state) => {
                        state.canvasSize.width = state.topology.width
                    })}
                >
                    Copy simulation width
                </Button>
                <Button
                    onClick={context.action((state) => {
                        state.topology.width = state.canvasSize.width
                        act.fixPosition(state)
                        state.redraw = true
                    })}
                >
                    Write width to simulation
                </Button>
            </li>
            <li>
                ⟷Full display width: <OxButton half icon={"/2"} path="canvasSize.fullwidth" />
                <OxInputNumber path="canvasSize.fullwidth" />
                <OxButton double icon={"x2"} path="canvasSize.fullwidth" />
            </li>
            <li>
                ⭥Canvas height: <OxButton half icon={"/2"} path="canvasSize.height" />
                <OxInputNumber path="canvasSize.height" />
                <OxButton double icon={"x2"} path="canvasSize.height" />
            </li>
            <li>
                <i className="fa fa-arrows-alt"></i>{" "}
                <Button
                    type={showZoomCanvasBoundary || redraw ? "primary" : "default"}
                    onClick={context.action((state) => {
                        state.showZoomCanvasBoundary = !state.showZoomCanvasBoundary
                    })}
                >
                    Show zoom area boundary
                </Button>
            </li>
        </ul>
    )
    return (
        <div>
            {presetControlElement}
            <Divider />
            <p>Fine grain control</p>
            {fineGrainControlElement}
        </div>
    )
}
