import { Segmented } from "antd"
import { useContext } from "react"

import { ReactContext } from "../state/ReactContext"
import { useStateSelection } from "./hooks"

export function InterventionSegmented() {
  const { status, propagation } = useStateSelection(({ divineMode }) => divineMode)
  let { act, context } = useContext(ReactContext)
  const options = ["off", "intervention", "propagation"]
  return (
    <Segmented
      options={options}
      value={status === "off" ? "off" : propagation ? "propagation" : "intervention"}
      onChange={(value) => {
        if (value === "off") {
          act.setDivineModeOff()
        } else {
          act.setDivineModeWaiting()
          console.log("value", value)
          context.updateState((state) => {
            state.divineMode.propagation = value === "propagation"
          })
        }
      }}
    />
  )
}
