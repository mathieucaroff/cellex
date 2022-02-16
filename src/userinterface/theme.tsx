import { Button, Popover } from "antd"
import { useContext } from "react"
import { SketchPicker } from "react-color"
import { colorToHexColor, hexColorToColor } from "../engine/color"

import { ReactContext } from "../state/reactcontext"
import { defaultColorMap } from "../state/state"
import { OxInput } from "./component"

export let ThemeContent = () => {
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
                    present={(colorMap) => colorMap.map((c) => colorToHexColor(c)).join(";")}
                    parse={(colorString) => colorString.split(";").map((h) => hexColorToColor(h))}
                />
            </li>
        </ul>
    )
    return <div>{ul}</div>
}
