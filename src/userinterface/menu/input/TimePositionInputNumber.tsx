import { InputNumber } from "antd"
import { useContext, useEffect, useState } from "react"

import { ReactContext } from "../../../state/ReactContext"

export function TimePositionInputNumber() {
  let { context } = useContext(ReactContext)
  let [value, setValue] = useState(0)

  useEffect(() => {
    let remove = context.usePosition(({ posT }) => {
      setValue(posT)
    })
    return remove
  }, [])

  return (
    <InputNumber
      value={value}
      onChange={(posT) => {
        context.updatePosition((position) => ({ ...position, posT }))
      }}
    />
  )
}
