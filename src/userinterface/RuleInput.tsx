import { Space } from "antd"

import { TableRuleAutomaton } from "../automatonType"
import { createAutomatonEngine } from "../engine/Engine"
import { randomGoodAutomatonFromDomainAndKind } from "../engine/curatedAutomata"
import { parseAutomaton, presentAutomaton, presentDomain } from "../nomenclature/nomenclature"
import { AutomatonViewHistorySelect } from "./AutomatonViewHistorySelect"
import { DomainSelect } from "./DomainSelect"
import { OxEnterInput } from "./components/OxEnterInput/OxEnterInput"
import { useStateSelection } from "./hooks"

export let RuleInput = () => {
  let {
    automaton: a,
    topology,
    colorMap,
  } = useStateSelection(({ automaton, topology, colorMap }) => ({ automaton, topology, colorMap }))

  let domain = presentDomain(a).descriptor
  let randomElementTitle =
    domain !== "e"
      ? `Random automaton on the same domain (${domain})`
      : `Random elementary ${a.kind === "tableRule" ? "rule" : "code"}`

  const parse = (input: string) => {
    // ensure the creation of the engine fails now rather than when it will be used for the user
    let automaton = parseAutomaton(input)

    let engine = createAutomatonEngine({
      automaton,
      seed: "_",
      topology,
      interventionColorIndex: 0,
    })
    engine.getLine(0)
    engine.getLine(1)
    engine.getLine(2)
    engine.getLine(0)

    if (automaton.stateCount > colorMap.length) {
      throw new Error(
        `Cannot display rules of ${automaton.stateCount} states with a palette of only ${colorMap.length} colors`,
      )
    }

    return automaton
  }

  return (
    <Space.Compact>
      <AutomatonViewHistorySelect />
      <DomainSelect />
      <OxEnterInput
        path="automaton"
        id="automatonInput"
        title="Set the simulated automaton"
        miniLabel="automaton"
        style={{ width: "initial" }}
        present={(automaton: TableRuleAutomaton) => presentAutomaton(automaton).descriptor}
        parse={parse}
        randomizer={() => randomGoodAutomatonFromDomainAndKind(a)}
        randomElementTitle={randomElementTitle}
      />
    </Space.Compact>
  )
}
