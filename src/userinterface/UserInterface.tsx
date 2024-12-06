import { useSyncExternalStore } from "react"

import { UserInterfaceDesktop } from "./UserInterfaceDesktop"
import { UserInterfaceImmersive } from "./UserInterfaceImmersive"
import { UserInterfacePhone } from "./UserInterfacePhone"
import { useStateSelection } from "./hooks"

export interface UserInterfaceProp {
  shortcutList: [string, string][]
  displayDiv: HTMLDivElement
}

export function getUiSizing(w: number): "sizeCLarge" | "sizeBMedium" | "sizeASmall" {
  return w > 1202 ? "sizeCLarge" : w > 725 ? "sizeBMedium" : "sizeASmall"
}

export let UserInterface = (prop: UserInterfaceProp) => {
  let { immersiveMode } = useStateSelection(({ immersiveMode }) => ({
    immersiveMode,
  }))

  let uiMode = useSyncExternalStore(
    (resizeHandler) => {
      window.addEventListener("resize", resizeHandler)
      return () => {
        window.removeEventListener("resize", resizeHandler)
      }
    },
    () => getUiSizing(window.innerWidth),
  )

  if (immersiveMode === "immersive") {
    return <UserInterfaceImmersive {...prop} />
  } else if (immersiveMode === "off") {
    if (uiMode === "sizeCLarge") {
      return <UserInterfaceDesktop {...prop} />
    } else {
      return <UserInterfacePhone {...prop} />
    }
  } else {
    throw new Error(`unexpected immersiveMode value: ${immersiveMode}`)
  }
}
