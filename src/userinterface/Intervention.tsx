import { Radio } from "antd"
import { useContext } from "react"

import { ReactContext } from "../state/ReactContext"
import { useStateSelection } from "./hooks"

export function InterventionSelector() {
  const { status, propagation } = useStateSelection(({ divineMode }) => divineMode)
  let { act, context } = useContext(ReactContext)

  let interventionValue = status === "off" ? "off" : propagation ? "propagation" : "intervention"

  return (
    <Radio.Group
      value={interventionValue}
      onChange={(ev) => {
        let { value } = ev.target
        if (value === "off") {
          act.setDivineModeOff()
        } else {
          act.setDivineModeWaiting()
          context.updateState((state) => {
            state.divineMode.propagation = value === "propagation"
          })
        }
      }}
      buttonStyle="solid"
    >
      {[
        {
          label: "off",
          title: "Turn off the modification mode",
        },
        {
          label: "intervention",
          title: "Modify a cell",
        },
        {
          label: "propagation",
          title: "Modify a cell and show which cells are affected",
        },
      ].map(({ label, title }) => (
        <Radio.Button
          key={label}
          value={label}
          onClick={() => {
            if (label === interventionValue) {
              act.setDivineModeOff()
            }
          }}
        >
          <div title={title}>{label}</div>
        </Radio.Button>
      ))}
    </Radio.Group>
  )
}
