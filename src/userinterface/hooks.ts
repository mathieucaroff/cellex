import { useContext, useEffect, useState } from "react"

import { ReactContext } from "../state/ReactContext"
import { State } from "../stateType"

export function useStateSelection<T>(selector: (s: State) => T): T {
  let { context } = useContext(ReactContext)
  let [piece, setPiece] = useState<T>(() => selector(context.getState()))
  useEffect(() => {
    return context.use<T>(selector).for((selection) => {
      setPiece(selection)
    })
  }, [])
  return piece
}

export function readPath(path: string, state: State) {
  let piece = state
  let nameList = path.split(".")
  let last = nameList.pop()!
  nameList.forEach((name) => {
    piece = piece[name]
  })
  return { piece, last }
}

export function useStatePath(path: string) {
  return useStateSelection((state: State) => {
    return readPath(path, state)
  })
}
