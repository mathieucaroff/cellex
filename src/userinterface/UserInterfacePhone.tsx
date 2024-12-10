import { Modal } from "antd"
import { useContext, useEffect } from "react"

import { ReactContext } from "../state/ReactContext"
import { UserInterfaceProp } from "./UserInterface"
import { DivGraft } from "./graft"
import { useStateSelection } from "./hooks"
import { BottomBar } from "./phone/BottomBar"

export function UserInterfacePhone(prop: UserInterfaceProp) {
  let { displayDiv } = prop
  let { context } = useContext(ReactContext)
  let { userHasInteracted } = useStateSelection(({ userHasInteracted }) => ({ userHasInteracted }))

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
      {userHasInteracted || (
        <Modal open footer={<></>}>
          <h1 className="title">Cellex</h1>
          <p className="subtitle">Unidimensional Cellular Automaton Explorer</p>
        </Modal>
      )}
      <DivGraft element={displayDiv} />
      <BottomBar />
    </>
  )
}