import { DesktopOrMobile, Pair } from "../../type"
import { createDesktopDragManager } from "./DesktopDragManager"
import { createPhoneDragManager } from "./PhoneDragManager"

// dragManager helps with implementing the panning and canvas resizing features

export interface DragManagerProp {
    /**
     * the element for which we want to listen for "drag events"
     */
    element: HTMLElement
    /**
     * the function to run at the beginning of the drag
     * to know the position of the thing being dragged at that
     */
    getDisplayInit: () => Pair
    desktopOrMobile: DesktopOrMobile
}

export let createDragManager = (prop: DragManagerProp) => {
    if (prop.desktopOrMobile === "desktop") {
        return createDesktopDragManager(prop)
    } else {
        return createPhoneDragManager(prop)
    }
}
