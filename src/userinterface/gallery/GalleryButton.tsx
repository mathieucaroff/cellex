import { Button, Modal } from "antd"
import { useContext, useEffect, useState } from "react"

import { ReactContext } from "../../state/ReactContext"
import { useStateSelection } from "../hooks"
import { AutomatonGallery } from "./AutomatonGallery"

/** Gallery button manages the opening and closing of the gallery.
 * It works in such a way that once the gallery modal has been opened it
 * never really closes. This allows to maintain its state until it is
 * reopen.
 */
export function GalleryButton() {
  /** hasBeenOpened is switched to true the first time the gallery is open.
   * it stays true afterward. */
  let [hasBeenOpened, setHasBeenOpened] = useState(false)
  /** doExpandFirst is passed to the AutomatonGallery to tell it to expand
   * the first collapse. It is set to true only once: just after the gallery
   * has finished opening. */
  let [doExpandFirst, setDoExpandFirst] = useState(false)

  let { context } = useContext(ReactContext)
  /** isOpen / setGalleryOpen / setGalleryClosed manage the opening and closing
   * of the gallery, overriding the Ant Design's handling. */
  let isOpen = useStateSelection((state) => state.galleryIsOpen)
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
        setDoExpandFirst(true)
      })
    }
    setGalleryOpen()
  }

  useEffect(() => {
    if (doExpandFirst) {
      setDoExpandFirst(false)
    }
  }, [doExpandFirst])

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
          <AutomatonGallery doExpandFirst={doExpandFirst} />
        </div>
      </Modal>
    </>
  )
}
