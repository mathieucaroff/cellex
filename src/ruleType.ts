export interface Domain {
  dimension: number
  neighborhoodSize: number
  stateCount: number
}

export interface TableRule extends Domain {
  kind: "tableRule"
  transitionTable: number[]
}

export interface TableCode extends Domain {
  kind: "tableCode"
  transitionTable: number[]
}

export interface FunctionRule extends Domain {
  kind: "functionRule"
  transitionFunction: (neighborhood: number[]) => number
}

export interface FreeFunctionRule extends Domain {
  kind: "freeFunctionRule"
  neighborhoodSize: 0
  stateCount: 0
  transitionFunction: (get: (s: number) => number) => number
}

export type Rule = TableRule | TableCode | FunctionRule | FreeFunctionRule
