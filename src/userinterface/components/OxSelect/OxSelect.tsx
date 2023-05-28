import { Select } from "antd"
import { useContext } from "react"

import { ReactContext } from "../../../state/ReactContext"
import { readPath, useStatePath } from "../../hooks"

const { Option } = Select

interface OxSelectProp {
  path: string
  valueArray: string[]
  disabled?: boolean
}

// OxSelect a select input
export function OxSelect(prop: OxSelectProp) {
  let { path, disabled, valueArray } = prop
  let { context } = useContext(ReactContext)
  let { piece, last } = useStatePath(path)

  return (
    <Select
      disabled={disabled}
      value={piece[last]}
      onChange={(value) => {
        context.updateState((state) => {
          let { piece, last } = readPath(path, state)
          piece[last] = value
        })
      }}
    >
      {valueArray.map((v) => (
        <Option value={v} key={v}>
          {v}
        </Option>
      ))}
    </Select>
  )
}
