import { useEffect, useRef } from "react"

export interface DivGraphProp {
    element: HTMLElement
}

export let DivGraft = (prop: DivGraphProp) => {
    let { element } = prop
    let ref = useRef<HTMLDivElement>(null)
    useEffect(() => {
        ref.current!.appendChild(element)
    }, [])
    return <div ref={ref}></div>
}

export interface SpanGraphProp {
    element: HTMLElement
}

export let SpanGraft = (prop: SpanGraphProp) => {
    let { element } = prop
    let ref = useRef<HTMLSpanElement>(null)
    useEffect(() => {
        ref.current!.appendChild(element)
    }, [])
    return <span ref={ref}></span>
}
