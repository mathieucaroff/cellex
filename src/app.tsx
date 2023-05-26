import { ConfigProvider, theme as antdTheme } from "antd"
import { useEffect, useState } from "react"

import { Act } from "./control/Act"
import { Context } from "./state/Context"
import { ReactContext } from "./state/ReactContext"
import { DarkMode } from "./stateType"
import { UserInterface } from "./userinterface/UserInterface"

export interface AppProp {
  act: Act
  context: Context
  helpList: [string, string][]
  displayDiv: HTMLDivElement
}

export function App(prop: AppProp) {
  const { act, context, helpList, displayDiv } = prop

  let [darkMode, setDarkMode] = useState<DarkMode>(() => context.getState().darkMode)
  useEffect(() => {
    context
      .use<DarkMode>((s) => s.darkMode)
      .for((darkModeState) => {
        setDarkMode(darkModeState)
        document.documentElement.className = darkModeState
      })
  }, [])

  return (
    <ReactContext.Provider value={{ act, context }}>
      <ConfigProvider theme={{ algorithm: darkMode === "dark" ? [antdTheme.darkAlgorithm] : [] }}>
        <UserInterface helpList={helpList} displayDiv={displayDiv} />
      </ConfigProvider>
    </ReactContext.Provider>
  )
}
