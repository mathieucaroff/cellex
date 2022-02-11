import * as ReactDOM from "react-dom"

import "antd/dist/antd.css"

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
import { nAryRule, parseRule, ruleName } from "./engine/rule"
import { ConfigurationPopoverButton } from "./gui/gui"

function main() {
    // /\ github corner / package
    let div = document.createElement("div")
    div.innerHTML = githubCornerHTML(packageInfo.repository, packageInfo.version)
    document.body.appendChild(div)
    // \/ canvas

    let state = defaultState()
    let context = createContext(state)

    // /\ canvas
    div = document.createElement("div")
    let canvas = document.createElement("canvas")
    document.body.appendChild(div)
    div.appendChild(canvas)
    // \/ canvas

    let appRoot = document.getElementById("appRoot")!

    // random rule
    let buttonRandomRule = document.createElement("button")
    buttonRandomRule.textContent = "🎲 random rule"
    buttonRandomRule.addEventListener(
        "click",
        (ev) => {
            context.updateState((state) => {
                state.rule = nAryRule()
            })
        },
        true,
    )
    appRoot.appendChild(buttonRandomRule)

    // random seed
    let buttonRandomSeed = document.createElement("button")
    buttonRandomSeed.textContent = "🎲 random seed"
    buttonRandomSeed.addEventListener(
        "click",
        (ev) => {
            context.updateState((state) => {
                state.seed = Math.random().toString(36).slice(2)
            })
        },
        true,
    )
    appRoot.appendChild(buttonRandomSeed)

    // configuration, react
    let span = document.createElement("span")
    appRoot.appendChild(span)
    let refreshReactConfiguration = () => {
        ReactDOM.render(ConfigurationPopoverButton({ context }), span)
    }
    context.use((state) => state).for(refreshReactConfiguration)
    context.usePosition(refreshReactConfiguration)

    // /\ control
    let info = createInfo(state)
    let act = createAct(context, info)

    keyboardBinding({
        act,
        keyKb: createKeyboardManager({
            element: document.body,
            evPropName: "key",
            capture: false,
        }),
        codeKb: createKeyboardManager({
            element: document.body,
            evPropName: "code",
            capture: false,
        }),
    })

    window.addEventListener("hashchange", () => {
        if (location.hash.length > 1) {
            context.updateState((state) => {
                state.rule = parseRule(location.hash.slice(1))
            })
        }
    })
    // \/ control

    // /\ display
    let display = createDisplay(context, canvas)
    context
        .use(({ rule, seed, topology }) => ({ rule, seed, topology }))
        .for(({ rule, seed, topology }, state) => {
            let randomMapper = createRandomMapper({ seedString: seed })
            let engine = createAutomatonEngine(rule, topology, randomMapper)
            location.hash = ruleName(rule)
            display.setEngine(engine)
            display.draw(state.posS, state.posT, true)
        })

    context
        .use(({ canvasSize }) => ({ canvasSize }))
        .for(({ canvasSize }, state) => {
            canvas.width = canvasSize.width
            canvas.height = canvasSize.height
            display.draw(state.posS, state.posT, true)
        })

    let dragManager = createDragManager({
        element: canvas,
        getDisplayInit: () => {
            let xy = { x: state.posS, y: state.posT }
            return xy
        },
    })

    dragManager.onMove((xy) => {
        context.updatePosition((position, state) => {
            position.posS = xy.x
            act.fixPosition()
            if (!state.play) {
                position.posT = Math.max(xy.y, 0)
            }
        })
    })

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
