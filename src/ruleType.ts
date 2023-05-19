export interface Domain {
  dimension: number
  neighborhoodSize: number
  stateCount: number
}

export interface Rule extends Domain {
  transitionFunction: number[]
}
