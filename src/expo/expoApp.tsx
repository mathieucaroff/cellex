import { Canvas, Image } from "@shopify/react-native-skia"
import { StatusBar } from "expo-status-bar"
import { View } from "react-native"

import { parseColorMap } from "../display/Display"
import { createAutomatonEngine } from "../engine/Engine"
import { randomGoodRule } from "../engine/curatedAutomata"
import { StochasticState } from "../patternlang/BorderType"
import { defaultColorMap } from "../state/state"
import { createImage } from "./image"

let cMap = (array: number[]) => ({
  cumulativeMap: array,
  total: array.slice(-1)[0],
})
let qw1: { quantity: 1; width: 1 } = { quantity: 1, width: 1 }
let zero: StochasticState = { type: "state", ...cMap([1]), ...qw1 }
let one: StochasticState = { type: "state", ...cMap([0, 1]), ...qw1 }

export function ExpoApp() {
  const colorMap = parseColorMap(defaultColorMap)
  const engine = createAutomatonEngine({
    automaton: randomGoodRule(),
    interventionColorIndex: 6,
    seed: "_",
    topology: {
      finitness: "finite",
      kind: "loop",
      width: 256,
      genesis: {
        center: { type: "group", content: [one], ...qw1 },
        cycleLeft: { type: "group", content: [zero], ...qw1 },
        cycleRight: { type: "group", content: [zero], ...qw1 },
      },
    },
  })

  return (
    <View>
      <Canvas style={{ flex: 1 }}>
        <Image
          image={createImage(engine, 256, 256, 256, 0, 0, 0, 0, colorMap)}
          fit="contain"
          x={0}
          y={0}
          width={256}
          height={256}
        />
      </Canvas>

      <StatusBar style="auto" />
    </View>
  )
}
