import { Checkbox } from "antd"
import { useContext } from "react"

import { ReactContext } from "../../../state/ReactContext"
import { readPath, useStatePath } from "../../hooks"

interface OxCheckboxProp {
  path: string
  disabled: boolean
}

// OxCheckbox is a checkbox input tied to a boolean value of the state
export function OxCheckbox(prop: OxCheckboxProp) {
  let { path, disabled } = prop
  let { context } = useContext(ReactContext)
  let { piece, last } = useStatePath(path)

  return (
    <Checkbox
      disabled={disabled}
      checked={piece[last]}
      onChange={(ev) => {
        context.updateState((state) => {
          let { piece, last } = readPath(path, state)
          piece[last] = ev.target.checked
        })
      }}
    ></Checkbox>
  )
}
