import { Segmented } from "antd"
import { useContext } from "react"

import { ReactContext } from "../state/ReactContext"
import { useStateSelection } from "./hooks"

export function InterventionSegmented() {
  const { status, propagation } = useStateSelection(({ divineMode }) => divineMode)
  let { act, context } = useContext(ReactContext)

  return (
    <Segmented
      options={[
        {
          label: "off",
          value: "off",
          title: "Turn off the modification mode",
        },
        {
          label: "intervention",
          value: "intervention",
          title: "Modify a cell",
        },
        {
          label: "propagation",
          value: "propagation",
          title: "Modify a cell and show which cells are affected",
        },
      ]}
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
