import { Modal } from "antd"

import { UiBar } from "./UiBar"
import { UserInterfaceProp } from "./UserInterface"
import { DivGraft } from "./graft"
import { useStateSelection } from "./hooks"

export function UserInterfacePhone(prop: UserInterfaceProp) {
  let { displayDiv, shortcutList, uiBarRef } = prop
  let { userHasInteracted } = useStateSelection(({ userHasInteracted }) => ({ userHasInteracted }))

  return (
    <>
      {userHasInteracted || (
        <Modal open footer={<></>}>
          <h1 className="title">Cellex</h1>
          <p className="subtitle">Unidimensional Cellular Automaton Explorer</p>
        </Modal>
      )}
      <DivGraft element={displayDiv} />
      <UiBar position="bottom" shortcutList={shortcutList} uiBarRef={uiBarRef} />
    </>
  )
}
