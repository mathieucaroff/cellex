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
    evKeyPropName: "key",
    capture: false,
    normalize: (s) => s.toUpperCase(),
    ignoreEvent: (ev) => ev.ctrlKey,
  })
  let codeKb = createKeyboardManager({
    element: globalElement,
    evKeyPropName: "code",
    capture: false,
    normalize: (s) => s,
    ignoreEvent: (ev) => ev.ctrlKey,
  })
  let specificKeyKb = createKeyboardManager({
    element: specificElement,
    evKeyPropName: "key",
    capture: false,
    normalize: (s) => s.toUpperCase(),
    ignoreEvent: (ev) => ev.ctrlKey,
  })

  let removerList = [] as (() => void)[]

  let help: [string, string][] = []

  let onKeydownForKb =
    (kb: KeyboardManager) =>
    (keyArray: string[], fn: () => void, keyName: string, description: string) => {
      keyArray.forEach((key) => {
        let { remove } = kb.onKeydown(key, fn)
        removerList.push(remove)
      })
      help.push([keyName, description])
    }

  let onSymbol = onKeydownForKb(keyKb)
  let onKeypress = onKeydownForKb(codeKb)
  let onSpecificSymbol = onKeydownForKb(specificKeyKb)

  onSpecificSymbol([" "], act.togglePlay, "[space]**", "toggle play / pause")
  onSpecificSymbol(["Enter"], act.singleStep, "[enter]**", "process a single generation")

  onSymbol(["ArrowLeft"], act.goLeft, "[left]", "move camera left*")
  onSymbol(["ArrowRight"], act.goRight, "[right]", "move camera right*")
  onSymbol(["ArrowUp"], act.goUp, "[up]", "move camera up")
  onSymbol(["ArrowDown"], act.goDown, "[down]", "move camera down")

  onSymbol(["Home"], act.pageLeft, "[home]", "move camera left one page*")
  onSymbol(["End"], act.pageRight, "[end]", "move camera right one page*")
  onSymbol(["PageUp"], act.pageUp, "[page up]", "move camera up one page")
  onSymbol(["PageDown"], act.pageDown, "[page down]", "move camera down one page")
  onSymbol(
    ["Backspace"],
    act.backspace,
    "[backspace]",
    "go back to the top and select the rule input box",
  )

  onKeypress(["Digit0"], act.gotoTop, "0", "go back to the top")

  onSymbol(["["], act.halfSpeed, "[", "half the speed")
  onSymbol(["]"], act.doubleSpeed, "]", "double the speed")

  onSymbol(["{"], act.gotoMaxLeft, "{", "move the camera to the left end of the simulation*")
  onSymbol(["|"], act.gotoCenter, "|", "center the camera*")
  onSymbol(["}"], act.gotoMaxRight, "}", "move the camera to the right end of the simulation*")

  onSymbol(["P"], act.togglePlay, "P", "toggle *P*lay / *P*ause")
  onSymbol(["R"], act.select("#ruleInput"), "R", "select the *R*ule input")
  onSymbol(["C"], act.focus("#displayDiv"), "C", "select the *C*anvas of the *C*elular automaton")
  onSymbol(
    ["E"],
    act.focus(".ruleEditor__controlButtonDiv button"),
    "E",
    "select the Simplify button of the Rule *E*ditor if it is open; otherwise, do nothing",
  )

  onKeypress(["Digit1", "Numpad1"], act.setGenesis("1(0)"), "1", "set the genesis to impulse 010")
  onKeypress(["Digit2", "Numpad2"], act.setGenesis("0(1)"), "2", "set the genesis to impulse 101")
  onKeypress(["Digit3", "Numpad3"], act.setGenesis("11(0)"), "3", "set the genesis to impulse 0110")
  onKeypress(["Digit4", "Numpad4"], act.setGenesis("00(1)"), "4", "set the genesis to impulse 1001")

  onKeypress(
    ["Digit5", "Numpad5"],
    act.setRandomGenesis("([0{19}1])"),
    "5",
    "set the genesis to random with 95% of 0 and 5% of 1",
  )
  onKeypress(
    ["Digit6", "Numpad6"],
    act.setRandomGenesis("([0001])"),
    "6",
    "set the genesis to random with 75% of 0 and 25% of 1",
  )
  onKeypress(
    ["Digit7", "Numpad7"],
    act.setRandomGenesis("([01])"),
    "7",
    "set the genesis to random with 50% of 0 and 50% of 1",
  )
  onKeypress(
    ["Digit8", "Numpad8"],
    act.setRandomGenesis("([0111])"),
    "9",
    "set the genesis to random with 25% of 0 and 75% of 1",
  )
  onKeypress(
    ["Digit9", "Numpad9"],
    act.setRandomGenesis("([01{19}])"),
    "9",
    "set the genesis to random with 5% of 0 and 95% of 1",
  )

  onKeypress(["Minus"], act.halfZoom, "-", "half the zoom level")
  onKeypress(["Equal"], act.doubleZoom, "+", "double the zoom level")

  return {
    remove: () => {
      removerList.forEach((f) => f())
    },
    getHelp: () => {
      return help
    },
  }
}
