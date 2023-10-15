import { Button } from "antd"
import { useContext } from "react"

import { TableAutomaton } from "../../automatonType"
import { isValidDomain } from "../../engine/domain"
import { ReactContext } from "../../state/ReactContext"
import { useStateSelection } from "../hooks"

export interface DomainChangeButtonInfo {
  ns: number
  cc: number
}

export interface DomainChangeButtonFullInfo extends DomainChangeButtonInfo {
  length: number
  kind: TableAutomaton["kind"]
}

export interface DomainChangeButtonProp {
  automaton: TableAutomaton
  delta: Partial<DomainChangeButtonInfo>
  derive: (table: number[], info: DomainChangeButtonFullInfo) => number[]
  label: (info: DomainChangeButtonInfo) => string
}

export function DomainChangeButton(prop: DomainChangeButtonProp) {
  let { automaton, delta, derive, label } = prop
  let { cc: dcc = 0, ns: dns = 0 } = delta
  let { context } = useContext(ReactContext)
  let { cc, ns } = useStateSelection(({ automaton: a }) => ({
    cc: a.stateCount,
    ns: a.neighborhoodSize,
  }))

  let i = { cc: cc + dcc, ns: ns + dns }

  return (
    <Button
      onClick={() => {
        context.updateState(({ automaton }) => {
          automaton.stateCount = i.cc
          automaton.neighborhoodSize = i.ns
          let length = automaton.kind === "tableCode" ? (i.cc - 1) * i.ns + 1 : i.cc ** i.ns
          let info = { ...i, length, kind: automaton.kind }
          automaton.transitionTable = derive(automaton.transitionTable, info)
        })
      }}
      disabled={!isValidDomain({ ...automaton, stateCount: i.cc, neighborhoodSize: i.ns })}
    >
      {label(i)}
    </Button>
  )
}
