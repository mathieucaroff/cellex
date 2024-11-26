import { useSyncExternalStore } from "react"

import { UserInterfaceDesktop } from "./UserInterfaceDesktop"
import { UserInterfaceImmersive } from "./UserInterfaceImmersive"
import { UserInterfacePhone } from "./UserInterfacePhone"
import { useStateSelection } from "./hooks"

export interface UserInterfaceProp {
  shortcutList: [string, string][]
  displayDiv: HTMLDivElement
  repositoryUrl: string
  version: string
  discordInviteUrl: string
}

export function getUiMode(): "desktop" | "phone" {
  return innerWidth > 400 ? "desktop" : "phone"
}

export let UserInterface = (prop: UserInterfaceProp) => {
  let { immersiveMode } = useStateSelection(({ immersiveMode }) => ({
    immersiveMode,
  }))

  let uiMode = useSyncExternalStore((resizeHandler) => {
    window.addEventListener("resize", resizeHandler)
    return () => {
      window.removeEventListener("resize", resizeHandler)
    }
  }, getUiMode)

  if (immersiveMode === "immersive") {
    return <UserInterfaceImmersive {...prop} />
  } else if (immersiveMode === "off") {
    if (uiMode === "desktop") {
      return <UserInterfaceDesktop {...prop} />
    } else {
      return <UserInterfacePhone {...prop} />
    }
  } else {
    throw new Error(`unexpected immersiveMode value: ${immersiveMode}`)
  }
}
