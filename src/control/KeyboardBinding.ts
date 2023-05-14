import { Remover } from "../type"
import { Act } from "./Act"
import { KeyboardManager, createKeyboardManager } from "./KeyboardManager"

export interface KeyboardBindingProp {
  act: Act
  globalElement: Element
  specificElement: Element
}

export interface KeyboardBinding extends Remover {
  getHelp: () => [string, string][]
}

export let keyboardBinding = (prop: KeyboardBindingProp): KeyboardBinding => {
  let { act, globalElement, specificElement } = prop

  /**
   * keyKb operates on keyboard configured symbol inputs,
   * while codeKb operates on keyboard key positions
   */
  let keyKb = createKeyboardManager({
    element: globalElement,
    evPropName: "key",
    capture: false,
    normalize: (s) => s.toUpperCase(),
  })
  let codeKb = createKeyboardManager({ element: globalElement, evPropName: "code", capture: false })
  let specificKeyKb = createKeyboardManager({
    element: specificElement,
    evPropName: "key",
    capture: false,
    normalize: (s) => s.toUpperCase(),
  })

  let removerList = [] as (() => void)[]

  let help: [string, string][] = []

  let onKeydownForKb =
    (kb: KeyboardManager) =>
    (key: string, fn: () => void, keyName: string, description: string) => {
      let { remove } = kb.onKeydown(key, fn)
      removerList.push(remove)
      help.push([keyName, description])
    }

  let onSymbol = onKeydownForKb(keyKb)
  let onKeypress = onKeydownForKb(codeKb)
  let onSpecificSymbol = onKeydownForKb(specificKeyKb)

  onSpecificSymbol(" ", act.togglePlay, "[space]", "toggle play / pause")
  onSpecificSymbol("Enter", act.singleStep, "[enter]", "process one time generation")

  onSymbol("ArrowLeft", act.goLeft, "[left]", "move camera left*")
  onSymbol("ArrowRight", act.goRight, "[right]", "move camera right*")
  onSymbol("ArrowUp", act.goUp, "[up]", "move camera up")
  onSymbol("ArrowDown", act.goDown, "[down]", "move camera down")

  onSymbol("Home", act.pageLeft, "[home]", "move camera left one page*")
  onSymbol("End", act.pageRight, "[end]", "move camera right one page*")
  onSymbol("PageUp", act.pageUp, "[page up]", "move camera up one page")
  onSymbol("PageDown", act.pageDown, "[page down]", "move camera down one page")
  onSymbol("Backspace", act.backspace, "[backspace]", "erease the current rule")

  onSymbol("[", act.halfSpeed, "[", "half the speed")
  onSymbol("]", act.doubleSpeed, "]", "double the speed")

  onSymbol("{", act.gotoMaxLeft, "{", "move the camera to the left end of the simulation*")
  onSymbol("|", act.gotoCenter, "|", "center the camera*")
  onSymbol("}", act.gotoMaxRight, "}", "move the camera to the right end of the simulation*")

  onSymbol("R", act.select("ruleInput"), "R", "select the *R*ule input")
  onSymbol("C", act.focus("displayDiv"), "C", "select the *C*anvas of the *C*elular automaton")

  onKeypress("Digit1", act.setGenesis("(0)1(0)"), "1", "set the genesis to impulse 010")
  onKeypress("Digit3", act.setGenesis("(0)11(0)"), "3", "set the genesis to impulse 0110")
  onKeypress("Digit5", act.setGenesis("(0)101(0)"), "5", "set the genesis to impulse 01010")
  onKeypress("Digit7", act.setGenesis("(0)111(0)"), "7", "set the genesis to impulse 01110")

  onKeypress(
    "Digit9",
    act.setRandomGenesis("([01])([01])"),
    "9",
    "set the genesis to random with 50% of 0 and 50% of 1",
  )
  onKeypress(
    "Digit8",
    act.setRandomGenesis("([0{9}1])([01{9}])"),
    "8",
    "set the genesis to random step from 10% of 1 to 90% of 1",
  )
  onKeypress(
    "Digit2",
    act.setRandomGenesis("(0[01])(0[01])"),
    "2",
    "set the genesis to 50% random but only on every other index",
  )
  onKeypress(
    "Digit4",
    act.setRandomGenesis("(000[01])(000[01])"),
    "4",
    "set the genesis to 50% random but only on four indices",
  )
  onKeypress(
    "Digit6",
    act.setRandomGenesis("(0{5}[01])(0{5}[01])"),
    "6",
    "set the genesis to 50% random but only on six indices",
  )

  onKeypress("Digit0", act.gotoTop, "0", "go back to the top")

  onKeypress("Minus", act.halfZoom, "-", "half the zoom level")
  onKeypress("Equal", act.doubleZoom, "+", "double the zoom level")

  return {
    remove: () => {
      removerList.forEach((f) => f())
    },
    getHelp: () => {
      return help
    },
  }
}
