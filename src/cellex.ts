import { githubCornerHTML } from "./lib/githubCorner"
import * as packageInfo from "../package.json"
import { createDisplay } from "./display/display"
import { createAutomatonEngine } from "./engine/engine"
import { createContext } from "./state/context"
import { defaultState } from "./state/state"
import { createRandomMapper } from "./engine/randomMapper"
import { emitterLoop } from "./util/emitterLoop"
import { createKeyboardManager } from "./control/keyboardManager"
import { keyboardBinding } from "./control/keyboardBinding"
import { createInfo } from "./control/info"
import { createAct } from "./control/act"
import { createDragManager } from "./control/dragManager"

function main() {
    let div = document.createElement("div")
    div.innerHTML = githubCornerHTML(packageInfo.repository, packageInfo.version)
    document.body.appendChild(div)

    div = document.createElement("div")
    let canvas = document.createElement("canvas")
    document.body.appendChild(div)
    div.appendChild(canvas)

    let state = defaultState()
    let context = createContext(state)

    let appRoot = document.getElementById("appRoot")!

    // /\ control
    let info = createInfo(state)
    let act = createAct(context, info)

    keyboardBinding({
        act,
        keyKb: createKeyboardManager({
            element: document.body,
            evPropName: "key",
        }),
        codeKb: createKeyboardManager({
            element: document.body,
            evPropName: "code",
        }),
    })
    // \/ control

    // /\ display
    let display = createDisplay(context, canvas)
    context
        .use(({ rule, seed, topology }) => ({ rule, seed, topology }))
        .for(({ rule, seed, topology }) => {
            let randomMapper = createRandomMapper({ seedString: seed })
            let engine = createAutomatonEngine(rule, topology, randomMapper)
            display.setEngine(engine)
        })

    let dragManager = createDragManager({
        element: document.documentElement,
        getDisplayInit: () => {
            let xy = { x: state.posS, y: state.posT }
            return xy
        },
    })

    dragManager.onMove((xy) => {
        context.updatePosition((position, state) => {
            position.posS = xy.x
            if (!state.play) {
                position.posT = Math.max(xy.y, 0)
            }
        })
    })

    display.init()
    emitterLoop(requestAnimationFrame).link(() => {
        if (state.play) {
            context.updatePosition((position) => {
                position.posT += state.speed
            })
        }
    })
    context.usePosition((position) => {
        display.draw(position.posS, position.posT, position.redraw)
        position.redraw = false
    })
    // \/ display
}
main()
