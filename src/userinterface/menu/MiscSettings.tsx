import { Button, Switch } from "antd"
import { useContext } from "react"

import { presentAutomaton } from "../../nomenclature/nomenclature"
import { presentTopBorder } from "../../patternlang/presenter"
import { ReactContext } from "../../state/ReactContext"
import { useStateSelection } from "../hooks"

export function MiscSettings() {
  let { context, act } = useContext(ReactContext)
  let [displayMinimap, infiniteHorizontalPanning, presentationMode] = useStateSelection(
    ({ displayMinimap, infiniteHorizontalPanning, presentationMode }) => {
      return [displayMinimap, infiniteHorizontalPanning, presentationMode]
    },
  )

  return (
    <>
      <ul>
        <li>
          <p>
            <Button style={{ marginRight: "10px" }} onClick={() => act.setGenesis("(0)1(0)")()}>
              Impulse Mode 1
            </Button>
            <Button style={{ marginRight: "10px" }} onClick={() => act.setGenesis("(0)11(0)")()}>
              Impulse Mode 3
            </Button>
            <Button onClick={() => act.setRandomGenesis("([0001])([0111])")()}>Random Mode</Button>
          </p>
        </li>
        <li>
          <p>
            <Switch
              checked={displayMinimap}
              onChange={(enabled) => {
                context.updateState((state) => (state.displayMinimap = enabled))
              }}
            />{" "}
            Display minimap
          </p>
        </li>
        <li>
          <p>
            <Switch
              checked={infiniteHorizontalPanning}
              onChange={(enabled) => {
                context.updateState((state) => (state.infiniteHorizontalPanning = enabled))
                act.fixPosition()
              }}
            />{" "}
            Infinite horizontal panning
          </p>
        </li>
        <li>
          <p>
            <Switch
              checked={presentationMode === "present"}
              onChange={(enabled) => {
                context.updateState(
                  (state) => (state.presentationMode = enabled ? "present" : "off"),
                )
              }}
            />{" "}
            Presentation mode
          </p>
        </li>
        <li>
          <p>
            <Button
              onClick={() => {
                const state = context.getState()
                const automatonName = presentAutomaton(state.automaton).descriptor
                const genesis = presentTopBorder(state.topology.genesis)
                let url = new URL(location.href)
                url.searchParams.set("genesis", genesis)
                url.searchParams.set("automaton", automatonName)
                history.pushState(null, "", url)
              }}
            >
              Export config to URL
            </Button>
          </p>
        </li>
      </ul>
    </>
  )
}
