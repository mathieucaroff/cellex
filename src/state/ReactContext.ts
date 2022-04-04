import * as React from "react"
import { Act } from "../control/Act"
import { Context } from "./Context"

export let ReactContext = React.createContext<{ act: Act; context: Context }>(null as any)
