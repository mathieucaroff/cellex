import { InputNumber } from "antd"
import { useContext, useEffect, useState } from "react"

import { ReactContext } from "../../../state/ReactContext"

export function SpacialPositionInputNumber() {
  let { context, info } = useContext(ReactContext)
  let [spacialPosition, setPosition] = useState(0)

  useEffect(() => {
    return context.usePosition(({ posS }) => {
      setPosition(posS)
    })
  }, [])

  return (
    <InputNumber
      value={spacialPosition}
      onChange={(posS) => {
        if (posS === null || posS < info.maxLeft() || posS > info.maxRight()) {
          return
        }
        setPosition(posS)
        context.updatePosition((position) => {
          position.posS = posS
        })
      }}
    />
  )
}
