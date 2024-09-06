"use client"

import { useEffect, useState } from "react"
import { cellex } from "../cellex"

export default function Home() {
  let [{ Component, prop }, setState] = useState(() => ({
    Component: (() => <div>loading...</div>) as any,
    prop: {} as any,
  }))
  useEffect(() => {
    setState(cellex(window))
  }, [])
  return <Component {...prop} />
}
