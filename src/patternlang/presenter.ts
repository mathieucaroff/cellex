import { BorderGroup, SideBorder, StochasticState, TopBorder } from "./BorderType"

export let presentTopBorder = (border: TopBorder): string => {
    let a = presentGroup(border.cycleLeft)
    let b = presentGroup(border.center)
    let c = presentGroup(border.cycleRight)
    return `(${a})${b}(${c})`
}
export let presentSideBorder = (border: SideBorder): string => {
    return `${presentGroup(border.init)}(${presentGroup(border.cycle)})`
}

export let presentGroup = (group: BorderGroup): string => {
    return decorate(
        group.content.map((x) => (x.type === "group" ? presentGroup(x) : presentState(x))).join(""),
        group,
        true,
    )
}

export let presentState = (state: StochasticState): string => {
    let last = 0
    let array: string[] = []
    state.cumulativeMap.forEach((counter, index) => {
        if (counter > last) {
            let diff = counter - last
            if (diff > 3) {
                array.push(index.toString(36) + `{${diff}}`)
            } else {
                array.push(index.toString(36).repeat(diff))
            }
        }
        last = counter
    })
    let result = array.join("")
    if (result.length > 1) {
        return decorate(`[${result}]`, state, false)
    } else {
        return decorate(result, state, false)
    }
}

export let decorate = (
    representation: string,
    border: BorderGroup | StochasticState,
    isGroup: boolean,
): string => {
    if (border.quantity > 1) {
        if (isGroup) {
            return `(${representation}){${border.quantity}}`
        } else {
            return `${representation}{${border.quantity}}`
        }
    }
    return representation
}
