import { Input } from "antd"
import { CSSProperties, useContext } from "react"

import { ReactContext } from "../../../state/ReactContext"
import { readPath, useStatePath } from "../../hooks"

interface OxInputProp {
  path: string
  disabled?: boolean
  style?: CSSProperties
  present?: (x: any) => string
  parse?: (y: string) => any
}

// OxInput an input tied to a value of the state
export function OxInput(prop: OxInputProp) {
  let { disabled, path, present = (x) => x, parse = (y) => y, style = {} } = prop
  let { context } = useContext(ReactContext)
  let { piece, last } = useStatePath(path)

  return (
    <Input
      style={{ width: "73%", ...style }}
      disabled={disabled}
      value={present(piece[last])}
      onChange={(ev) => {
        context.updateState((state) => {
          let { piece, last } = readPath(path, state)
          piece[last] = parse(ev.target.value)
        })
      }}
    />
  )
}
