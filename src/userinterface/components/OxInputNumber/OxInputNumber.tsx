import { InputNumber } from "antd"
import { useContext } from "react"

import { ReactContext } from "../../../state/ReactContext"
import { readPath, useStatePath } from "../../hooks"

interface OxInputNumberProp {
  path: string
}

// OxInputNumber an input tied to a numeric value of the state
export function OxInputNumber(prop: OxInputNumberProp) {
  let { path } = prop
  let { context } = useContext(ReactContext)
  let { piece, last } = useStatePath(path)

  return (
    <InputNumber
      value={piece[last]}
      onChange={(value) => {
        context.updateState((state) => {
          let { piece, last } = readPath(path, state)
          piece[last] = value
        })
      }}
    ></InputNumber>
  )
}
