import { Select, SelectProps } from "antd"
import { useContext } from "react"

import { ReactContext } from "../../../state/ReactContext"
import { readPath, useStatePath } from "../../hooks"

const { Option } = Select

interface OxSelectProp extends Omit<SelectProps, "value" | "options"> {
  path: string
  valueArray: string[]
}

// OxSelect a select input
export function OxSelect(prop: OxSelectProp) {
  let { path, valueArray, ...rest } = prop
  let { context } = useContext(ReactContext)
  let { piece, last } = useStatePath(path)

  return (
    <Select
      value={piece[last]}
      onChange={(value) => {
        context.updateState((state) => {
          let { piece, last } = readPath(path, state)
          piece[last] = value
        })
      }}
      {...rest}
      options={valueArray.map((v) => ({ label: v }))}
    />
  )
}
