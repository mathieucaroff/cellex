import { InputNumber } from "antd"
import { useContext, useEffect, useState } from "react"

import { ReactContext } from "../../../state/ReactContext"

export function TimePositionInputNumber() {
  let { context } = useContext(ReactContext)
  let [timePosition, setPosition] = useState(0)

  useEffect(() => {
    return context.usePosition(({ posT }) => {
      setPosition(posT)
    })
  }, [])

  return (
    <InputNumber
      value={timePosition}
      onChange={(posT) => {
        if (posT < 0) {
          return
        }
        setPosition(posT)
        context.updatePosition((position) => {
          position.posT = posT
        })
      }}
    />
  )
}
