import { Button, ColorPicker } from "antd"
import { useContext } from "react"

import { parseColorMap, presentColorMap } from "../../display/Display"
import { randomPalette } from "../../palette/randomPalette"
import { ReactContext } from "../../state/ReactContext"
import { defaultColorMap, oldColorMap } from "../../state/state"
import { Color } from "../../type"
import { OxInput } from "../components/OxInput/OxInput"
import { useStateSelection } from "../hooks"

export function Palette() {
  let { context } = useContext(ReactContext)
  let { colorMap, stateCount } = useStateSelection(({ automaton: { stateCount }, colorMap }) => ({
    colorMap,
    stateCount,
  }))

  return (
    <div>
      <ul>
        {colorMap.map((c, k) => (
          <li key={k}>
            Color #{k}:{" "}
            <ColorPicker
              showText
              value={{ r: c.red, g: c.green, b: c.blue } as any}
              disabled={k >= stateCount && k !== colorMap.length - 1}
              onChange={(color) => {
                const rgb = color.toRgb()
                context.updateState((state) => {
                  state.colorMap[k] = {
                    red: rgb.r,
                    green: rgb.g,
                    blue: rgb.b,
                  }
                })
              }}
            />
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
                state.colorMap = parseColorMap(oldColorMap)
              })
            }}
          >
            Use the old color map
          </Button>
          <Button
            onClick={() => {
              context.updateState((state) => {
                state.colorMap = parseColorMap(defaultColorMap)
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
    </div>
  )
}
