import { ConfigProvider, theme as antdTheme } from "antd"
import { StrictMode, useEffect, useState } from "react"

import { Act } from "./control/Act"
import { Info } from "./control/Info"
import { Context } from "./state/Context"
import { ReactContext } from "./state/ReactContext"
import { DarkMode } from "./stateType"
import { UserInterface } from "./userinterface/UserInterface"

export interface AppProp {
  act: Act
  context: Context
  info: Info
  shortcutList: [string, string][]
  displayDiv: HTMLDivElement
}

export function App(prop: AppProp) {
  const { act, context, info, shortcutList, displayDiv } = prop

  let [darkMode, setDarkMode] = useState<DarkMode>(() => context.getState().darkMode)
  useEffect(() => {
    context
      .use<DarkMode>((s) => s.darkMode)
      .for((darkModeValue) => {
        setDarkMode(darkModeValue)
        if (darkModeValue === "dark") {
          document.documentElement.classList.add("dark")
          document.documentElement.classList.remove("light")
        } else {
          document.documentElement.classList.remove("dark")
          document.documentElement.classList.add("light")
        }
      })
  }, [])

  return (
    <StrictMode>
      <ReactContext.Provider value={{ act, context, info }}>
        <ConfigProvider theme={{ algorithm: darkMode === "dark" ? [antdTheme.darkAlgorithm] : [] }}>
          <UserInterface shortcutList={shortcutList} displayDiv={displayDiv} />
        </ConfigProvider>
      </ReactContext.Provider>
    </StrictMode>
  )
}
