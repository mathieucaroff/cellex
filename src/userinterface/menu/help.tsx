import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Button } from "antd"
import { useContext } from "react"

import { ReactContext } from "../state/reactcontext"

export interface HelpContentProp {
    helpList: [string, string][]
}

export let HelpContent = (prop: HelpContentProp) => {
    let { helpList } = prop
    let ul = (
        <ul>
            {helpList.map((row, k) => {
                let [key, description] = row
                return (
                    <li key={k}>
                        <kbd>{key}</kbd> {description}
                    </li>
                )
            })}
        </ul>
    )
    let ul2 = (
        <ul>
            <li>b binary (2)</li>
            <li>t ternary (3)</li>
            <li>q quad (4)</li>
            <li>p penta (5)</li>
            <li>h hexa (6)</li>
        </ul>
    )
    return (
        <div style={{ width: "600px" }}>
            <p>While the display is selected, the following shortcuts are available:</p>
            {ul}
            <p>
                [*]moving the camera horizontally is only possible when the simulation is bigger
                than the camera. You can set the camera size (canvas size) in the Display menu, and
                set the simulation size in the Engine menu.
            </p>
            <p>
                The rules can have from <b>two</b> to <b>six</b> distinct states:
            </p>
            {ul2}
        </div>
    )
}
