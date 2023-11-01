import { Button, ButtonProps } from "antd"
import { useContext } from "react"

import { ReactContext } from "../../../state/ReactContext"
import { readPath } from "../../hooks"

interface OxButtonProp extends ButtonProps {
  path: string
  switchValue?: string[]
  toggle?: boolean
  half?: boolean
  double?: boolean
  floor?: boolean
  ceil?: boolean
}

// OxButton
export function OxButton(prop: OxButtonProp) {
  let { path, switchValue, toggle, half, double, floor, ceil, ...buttonParameter } = prop
  let { context } = useContext(ReactContext)

  if (toggle) {
    buttonParameter.onClick = () => {
      context.updateState((state) => {
        let { piece, last } = readPath(path, state)
        piece[last] = !piece[last]
      })
    }
  } else if (switchValue) {
    buttonParameter.onClick = () => {
      context.updateState((state) => {
        let { piece, last } = readPath(path, state)
        let index = switchValue.indexOf(piece[last])
        piece[last] = switchValue[(index + 1) % switchValue.length]
      })
    }
  } else if (half || double) {
    let ratio = half ? 1 / 2 : 2
    buttonParameter.onClick = () => {
      context.updateState((state) => {
        let { piece, last } = readPath(path, state)
        piece[last] *= ratio
        if (floor) {
          piece[last] = Math.floor(piece[last])
        }
        if (ceil) {
          piece[last] = Math.ceil(piece[last])
        }
      })
    }
  }

  return <Button {...buttonParameter} />
}
