"use client"

import { useEffect, useState } from "react"
import { cellex } from "./cellex"

export function AppHome() {
  let [{ Component, prop }, setComponent] = useState(() => ({
    Component: (() => <div>loading...</div>) as any,
    prop: {} as any,
  }))

  useEffect(() => {
    setComponent({ ...cellex(window) })
  }, [])

  return <Component {...prop} />
}
