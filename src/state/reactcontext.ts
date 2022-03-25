import * as React from "react"
import { Act } from "../engine/act"
import { Context } from "./context"

export let ReactContext = React.createContext<{ act: Act; context: Context }>(null as any)
