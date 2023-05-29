import { Button } from "antd"
import { useContext } from "react"

import { ReactContext } from "../../../state/ReactContext"
import { readPath } from "../../hooks"

interface OxButtonProp {
  path: string
  icon: React.ReactNode
  disabled?: boolean
  half?: boolean
  double?: boolean
}

// OxButton
export function OxButton(prop: OxButtonProp) {
  let { path, icon, disabled, half, double } = prop
  let { context } = useContext(ReactContext)

  let buttonParameter: any = { icon, disabled }

  if (half || double) {
    let ratio = half ? 1 / 2 : 2
    buttonParameter.onClick = () => {
      context.updateState((state) => {
        let { piece, last } = readPath(path, state)
        piece[last] *= ratio
      })
    }
  }

  return <Button {...buttonParameter} />
}