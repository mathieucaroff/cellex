import { useEffect, useRef } from "react"

export interface DivGraftProp {
  element: HTMLElement
}

export let DivGraft = (prop: DivGraftProp) => {
  let { element } = prop
  let ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current!.appendChild(element)
  }, [])
  return <div ref={ref}></div>
}

export interface SpanGraftProp {
  element: HTMLElement
}

export let SpanGraft = (prop: SpanGraftProp) => {
  let { element } = prop
  let ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    ref.current!.appendChild(element)
  }, [])
  return <span ref={ref}></span>
}
