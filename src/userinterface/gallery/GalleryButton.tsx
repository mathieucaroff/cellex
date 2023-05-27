import { Button, Modal } from "antd"
import { useContext, useLayoutEffect } from "react"

import { ReactContext } from "../../state/ReactContext"
import { useStateSelection } from "../hooks"
import { AutomatonGallery } from "./AutomatonGallery"

export function GalleryButton() {
  let { context } = useContext(ReactContext)
  let isOpen = useStateSelection((state) => state.galleryIsOpen)

  let setGalleryOpen = () => {
    context.updateState((state) => {
      state.galleryIsOpen = true
    })
  }

  let setGalleryClosed = () => {
    context.updateState((state) => {
      state.galleryIsOpen = false
    })
  }

  useLayoutEffect(() => {
    let modalRoot = document.querySelector<HTMLDivElement>(".ant-modal-root")
    if (isOpen) {
      modalRoot.classList.add("oxModalIsOpen")
      document.body.classList.remove("overflowYAuto")
    } else {
      modalRoot.classList.remove("oxModalIsOpen")
      document.body.classList.add("overflowYAuto")
    }
  }, [isOpen])

  return (
    <>
      <Button onClick={setGalleryOpen}>🎨 Gallery</Button>
      <Modal
        open
        title="Automaton Gallery"
        onCancel={setGalleryClosed}
        footer={[]}
        width={window.innerWidth - 10}
      >
        <div className="automatonGalleryModal">
          <AutomatonGallery />
        </div>
      </Modal>
    </>
  )
}
