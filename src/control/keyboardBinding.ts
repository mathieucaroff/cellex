import { KeyboardManager } from "./keyboardManager"
import { Remover } from "../type"
import { Act } from "../engine/act"

export interface KeyboardBindingProp {
    act: Act
    keyKb: KeyboardManager
    codeKb: KeyboardManager
}

export interface KeyboardBinding extends Remover {
    getHelp: () => [string, string][]
}

export let keyboardBinding = (prop: KeyboardBindingProp): KeyboardBinding => {
    let { act, keyKb, codeKb } = prop

    let removerList = [] as (() => void)[]

    let help: [string, string][] = []

    let onKeydownForKb =
        (kb: KeyboardManager) =>
        (key: string, fn: () => void, keyName: string, description: string) => {
            let { remove } = kb.onKeydown(key, fn)
            removerList.push(remove)
            help.push([keyName, description])
        }

    let onKeydown = onKeydownForKb(keyKb)
    let codeOnKeydown = onKeydownForKb(codeKb)

    onKeydown(" ", act.togglePlay, "[space]", "toggle play / pause")
    onKeydown("Enter", act.singleStep, "[enter]", "process one time generation")

    onKeydown("ArrowLeft", act.goLeft, "[left]", "move camera left*")
    onKeydown("ArrowRight", act.goRight, "[right]", "move camera right*")
    onKeydown("ArrowUp", act.goUp, "[up]", "move camera up")
    onKeydown("ArrowDown", act.goDown, "[down]", "move camera down")

    onKeydown("Home", act.pageLeft, "[home]", "move camera left one page*")
    onKeydown("End", act.pageRight, "[end]", "move camera right one page*")
    onKeydown("PageUp", act.pageUp, "[page up]", "move camera up one page")
    onKeydown("PageDown", act.pageDown, "[page down]", "move camera down one page")

    onKeydown("[", act.decreaseSpeed, "[", "decrease speed")
    onKeydown("]", act.increaseSpeed, "]", "increase speed")

    onKeydown("{", act.gotoMaxLeft, "{", "move the camera to the left end of the simulation*")
    onKeydown("|", act.gotoCenter, "|", "center the camera*")
    onKeydown("}", act.gotoMaxRight, "}", "move the camera to the right end of the simulation*")

    codeOnKeydown("Digit0", act.gotoTop, "0", "go back to the top")

    codeOnKeydown("Minus", act.decreaseZoom, "-", "decrease the zoom level")
    codeOnKeydown("Equal", act.increaseZoom, "+", "increase the zoom level")

    return {
        remove: () => {
            removerList.forEach((f) => f())
        },
        getHelp: () => {
            return help
        },
    }
}
