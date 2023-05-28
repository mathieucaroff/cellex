import * as React from "react"

import { Act } from "../control/Act"
import { Info } from "../control/Info"
import { Context } from "./Context"

export let ReactContext = React.createContext<{ act: Act; context: Context; info: Info }>(
  null as any,
)
