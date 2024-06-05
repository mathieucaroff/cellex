import { Info } from "../control/Info"
import { State } from "../stateType"
import { clamp } from "../util/clamp"

export function createSafeStateWriter(state: State, info: Info) {
  let me = {
    setPosS: (posS: number) => {
      if (state.topology.width * state.zoom <= state.canvasSize.width) {
        state.posS = 0
      } else {
        state.posS = clamp(posS, info.maxLeft(), info.maxRight())
      }
    },
    setPosT: (posT: number) => {
      state.posT = Math.max(posT, 0)
    },
  }
  return me
}

export type SafeStateWriter = ReturnType<typeof createSafeStateWriter>
