import { Button, Modal } from "antd"
import { useContext, useEffect, useState } from "react"

import { ReactContext } from "../../state/ReactContext"
import { useStateSelection } from "../hooks"
import { AutomatonGallery } from "./AutomatonGallery"

export function GalleryButton() {
  let { context } = useContext(ReactContext)
  let isOpen = useStateSelection((state) => state.galleryIsOpen)
  let [doOpenFirst, setDoOpenFirst] = useState(false)
  let [hasBeenOpened, setHasBeenOpened] = useState(false)

  let galleryIsOpenSetter = (value: boolean) => () => {
    context.updateState((state) => {
      state.galleryIsOpen = value
    })
  }

  let setGalleryOpen = galleryIsOpenSetter(true)
  let setGalleryClosed = galleryIsOpenSetter(false)

  let openGallery = () => {
    if (!hasBeenOpened) {
      setHasBeenOpened(true)
      setTimeout(() => {
        setDoOpenFirst(true)
      })
    }
    setGalleryOpen()
  }

  useEffect(() => {
    if (doOpenFirst) {
      setDoOpenFirst(false)
    }
  }, [doOpenFirst])

  useEffect(() => {
    let modalRoot = document.querySelector<HTMLDivElement>(".ant-modal-root")
    if (!modalRoot) {
      console.error("modalRoot not found; no class has been set anywhere")
      return
    }
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
      <Button onClick={openGallery}>🎨 Gallery</Button>
      <Modal
        open
        title="Automaton Gallery"
        onCancel={setGalleryClosed}
        footer={[]}
        width={window.innerWidth - 10}
      >
        <div className="automatonGalleryModal">
          <AutomatonGallery doOpenFirst={doOpenFirst} />
        </div>
      </Modal>
    </>
  )
}
