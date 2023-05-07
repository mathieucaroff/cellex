import { Button, Popover } from "antd"
import { useContext } from "react"
import { SketchPicker } from "react-color"

import { parseColorMap, presentColorMap } from "../../display/Display"
import { colorToHexColor } from "../../engine/color"
import { randomPalette } from "../../palette/randomPalette"
import { ReactContext } from "../../state/ReactContext"
import { defaultColorMap } from "../../state/state"
import { Color } from "../../type"
import { OxInput } from "../component"

export let PaletteUI = () => {
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
              let palette = randomPalette(state.colorMap.length - 1)
              let reorderedPalette: Color[] = Array.from(palette, (_, k) => {
                let half = Math.floor(k / 2)
                if (k % 2 > 0) {
                  return palette[palette.length - 1 - half]
                } else {
                  return palette[half]
                }
              })
              state.colorMap = [state.colorMap[0], ...reorderedPalette]
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
