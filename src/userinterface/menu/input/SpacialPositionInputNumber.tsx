import { InputNumber } from "antd"
import { useContext, useSyncExternalStore } from "react"

import { ReactContext } from "../../../state/ReactContext"

export function SpacialPositionInputNumber() {
  let { context, info } = useContext(ReactContext)

  let spatialPosition = useSyncExternalStore(
    (callback) => {
      return context.usePosition(callback)
    },
    () => {
      return context.getState().posS
    },
  )

  return (
    <InputNumber
      value={spatialPosition}
      onChange={(posS) => {
        let state = context.getState()
        if (state.infiniteHorizontalPanning) {
          let { width } = state.topology
          posS = (posS + width) % width
        } else if (posS < info.maxLeft() || posS > info.maxRight()) {
          return
        }
        context.updatePosition((position) => {
          position.posS = posS
        })
      }}
    />
  )
}
