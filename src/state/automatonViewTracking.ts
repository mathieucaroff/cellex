import { presentAutomaton } from "../nomenclature/nomenclature"
import { presentTopBorder } from "../patternlang/presenter"
import { Context } from "./Context"

export function enableAutomatonViewTracking(context: Context) {
  context
    .use((s) => [s.automaton, s.topology] as const)
    .for(([automaton, topology]) => {
      let automatonString = presentAutomaton(automaton).descriptor
      let genesisString = presentTopBorder(topology.genesis)
      let automatonViewEntry = `${automatonString}@${genesisString}`

      context.updateState((state) => {
        let index = state.history.indexOf(automatonViewEntry)
        if (index >= 0) {
          state.history.splice(index, 1)
        }
        state.history.unshift(automatonViewEntry)

        // Limit the history length to 100 entries
        state.history.splice(100, state.history.length - 100)
      })
    })
}
