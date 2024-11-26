import { Modal } from "antd"
import { useContext, useEffect } from "react"

import { ReactContext } from "../state/ReactContext"
import { UserInterfaceProp } from "./UserInterface"
import { DivGraft } from "./graft"
import { useStateSelection } from "./hooks"

export function UserInterfacePhone(prop: UserInterfaceProp) {
  let { shortcutList, displayDiv, repositoryUrl, version, discordInviteUrl } = prop
  let { act, context } = useContext(ReactContext)
  let { automaton, play, userHasInteracted } = useStateSelection(
    ({ automaton, play, userHasInteracted }) => ({ automaton, play }),
  )

  useEffect(() => {
    context.updateState((state) => {
      state.canvasSize = {
        width: window.innerWidth,
        height: window.innerHeight,
      }
    })
  }, [])

  return (
    <>
      <DivGraft element={displayDiv} />
      {userHasInteracted || (
        <Modal open>
          <h1 className="title">Cellex</h1>
          <p className="subtitle">Unidimensional Cellular Automaton Explorer</p>
        </Modal>
      )}
    </>
  )
}
