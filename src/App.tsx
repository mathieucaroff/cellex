import { ConfigProvider, theme as antdTheme } from "antd"
import { StrictMode, useEffect, useState } from "react"

import packageInfo from "../package.json"
import { Act } from "./control/Act"
import { Info } from "./control/Info"
import { Context } from "./state/Context"
import { ReactContext } from "./state/ReactContext"
import { DarkMode } from "./stateType"
import { UserInterface } from "./userinterface/UserInterface"

import "./style.ant.custom.css"
import "./style.css"

export interface AppProp {
  act: Act
  context: Context
  info: Info
  shortcutList: [string, string][]
  displayDiv: HTMLDivElement
}

const version = `${packageInfo.version}-${process.env.COMMIT_HASH}`

export function App(prop: AppProp) {
  const { act, context, info, shortcutList, displayDiv } = prop

  let [darkMode, setDarkMode] = useState<DarkMode>(
    () => context.getState().darkMode,
  )
  useEffect(() => {
    context
      .use<DarkMode>((s) => s.darkMode)
      .for((darkModeState) => {
        setDarkMode(darkModeState)
        document.documentElement.className = darkModeState
      })
  }, [])

  return (
    <StrictMode>
      <ReactContext.Provider value={{ act, context, info }}>
        <ConfigProvider
          theme={{
            algorithm: darkMode === "dark" ? [antdTheme.darkAlgorithm] : [],
          }}
        >
          <UserInterface
            shortcutList={shortcutList}
            displayDiv={displayDiv}
            repositoryUrl={packageInfo.repository}
            version={version}
            discordInviteUrl={process.env.DISCORD_INVITE_URL}
          />
        </ConfigProvider>
      </ReactContext.Provider>
    </StrictMode>
  )
}
