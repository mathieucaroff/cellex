// select.ts -- computations derived from the state

import { parseRule } from "../engine/rule"
import { Context } from "./context"

export let useRule = (context: Context) => {
    context.use(({ ruleInput }) => parseRule(ruleInput))
}
