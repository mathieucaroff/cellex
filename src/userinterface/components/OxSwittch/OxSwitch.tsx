import { Switch } from "antd"
import { useContext } from "react"

import { ReactContext } from "../../../state/ReactContext"
import { readPath, useStatePath } from "../../hooks"

interface OxCheckboxProp {
  path: string
  disabled?: boolean
  title?: string
}

// OxSwitch is a switch tied to a boolean value of the state
export function OxSwitch(prop: OxCheckboxProp) {
  let { path, disabled, title } = prop
  let { context } = useContext(ReactContext)
  let { piece, last } = useStatePath(path)

  return (
    <Switch
      disabled={disabled}
      title={title}
      checked={piece[last]}
      onChange={(value) => {
        context.updateState((state) => {
          let { piece, last } = readPath(path, state)
          piece[last] = value
        })
      }}
    />
  )
}
