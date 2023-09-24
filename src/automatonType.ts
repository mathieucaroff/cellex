export interface Domain {
  dimension: number
  neighborhoodSize: number
  stateCount: number
  reversible: boolean
}

export interface TableRuleAutomaton extends Domain {
  kind: "tableRule"
  transitionTable: number[]
}

export interface TableCodeAutomaton extends Domain {
  kind: "tableCode"
  transitionTable: number[]
}

export interface FunctionAutomaton extends Domain {
  kind: "functionRule"
  transitionFunction: (neighborhood: number[]) => number
}

export interface FreeFunctionAutomaton extends Domain {
  kind: "freeFunctionRule"
  neighborhoodSize: 0
  stateCount: 0
  transitionFunction: (get: (s: number) => number) => number
}

export type Automaton =
  | TableRuleAutomaton
  | TableCodeAutomaton
  | FunctionAutomaton
  | FreeFunctionAutomaton
