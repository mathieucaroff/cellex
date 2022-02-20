import { Button, Popover } from "antd"
import { useContext } from "react"
import { SketchPicker } from "react-color"

import { parseColorMap, presentColorMap } from "../display/display"
import { colorToHexColor } from "../engine/color"
import { randomPalette } from "../palette/randompalette"
import { ReactContext } from "../state/reactcontext"
import { defaultColorMap } from "../state/state"
import { OxInput } from "./component"

export let PaletteContent = () => {
    let { context } = useContext(ReactContext)
    let ul = (
        <ul>
            {context.getState().colorMap.map((c, k) => (
                <li key={k}>
                    Color #{k}:{" "}
                    <Popover
                        placement="bottomLeft"
                        title={`Select color #${k + 1}`}
                        content={
                            <SketchPicker
                                color={{ r: c.red, g: c.green, b: c.blue }}
                                onChange={({ rgb }) => {
                                    context.updateState((state) => {
                                        state.colorMap[k] = {
                                            red: rgb.r,
                                            green: rgb.g,
                                            blue: rgb.b,
                                        }
                                    })
                                }}
                            />
                        }
                        trigger="click"
                    >
                        <Button style={{ backgroundColor: colorToHexColor(c) }}>✏️</Button>
                    </Popover>
                </li>
            ))}
            <li>
                <Button
                    onClick={() => {
                        context.updateState((state) => {
                            state.colorMap = [
                                state.colorMap[0],
                                ...randomPalette(state.colorMap.length - 1),
                            ]
                            state.redraw = true
                        })
                    }}
                >
                    Randomize palette
                </Button>
            </li>
            <li>
                <Button
                    onClick={() => {
                        context.updateState((state) => {
                            state.colorMap = defaultColorMap()
                            state.redraw = true
                        })
                    }}
                >
                    Reset color palette
                </Button>
            </li>
            <li>
                Import, export palette:
                <OxInput
                    style={{ display: "block", width: "100%" }}
                    path="colorMap"
                    present={presentColorMap}
                    parse={parseColorMap}
                />
            </li>
        </ul>
    )
    return <div>{ul}</div>
}
