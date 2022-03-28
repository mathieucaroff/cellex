import { BorderElement, BorderGroup, BorderRootGroup, StochasticState } from "./BorderType"

export let group =
    (content: BorderElement[]) =>
    (quantity: number): BorderGroup => ({
        quantity,
        width: quantity * content.reduce((a, b) => a + b.width, 0),
        type: "group",
        content: content,
    })

export let rootGroup = (content: BorderElement[]): BorderRootGroup =>
    group(content)(1) as BorderRootGroup

export let stochastic =
    (cumulativeMap: number[]) =>
    (quantity: number, width: number): StochasticState => ({
        quantity,
        width,
        type: "state",
        cumulativeMap,
        total: cumulativeMap.slice(-1)[0],
    })
