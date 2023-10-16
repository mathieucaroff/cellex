import { Button } from "antd"
import { useContext } from "react"

import { TableAutomaton } from "../../automatonType"
import {
  isPowerOfTwo,
  isValidDomain,
  nextPowerOfTwo,
  previousPowerOfTwo,
} from "../../engine/domain"
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

  let { reversible } = automaton
  let repetitionCount = 1
  if (reversible && dcc === 1) {
    repetitionCount = nextPowerOfTwo(cc) - cc
  } else if (reversible && dcc === -1) {
    repetitionCount = cc - previousPowerOfTwo(cc)
  }
  let finalDomain: TableAutomaton = {
    ...automaton,
    stateCount: cc + dcc * repetitionCount,
    neighborhoodSize: ns + dns * repetitionCount,
  }

  return (
    <Button
      onClick={() => {
        context.updateState(({ automaton }) => {
          let info = { cc, ns }
          for (; repetitionCount > 0; repetitionCount -= 1) {
            info.cc += dcc
            info.ns += dns
            let length =
              automaton.kind === "tableCode" ? (info.cc - 1) * info.ns + 1 : info.cc ** info.ns
            automaton.transitionTable = derive(automaton.transitionTable, {
              ...info,
              length,
              kind: automaton.kind,
            })
          }
          automaton.stateCount = finalDomain.stateCount
          automaton.neighborhoodSize = finalDomain.neighborhoodSize
        })
      }}
      disabled={!isValidDomain(finalDomain)}
    >
      {label({ cc: finalDomain.stateCount, ns: finalDomain.neighborhoodSize })}
    </Button>
  )
}
