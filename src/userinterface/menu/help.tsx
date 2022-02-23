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
    let p = <p>The rules can have between two and six distinct states:</p>
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
        <div>
            <p>While the display is selected, the following shortcuts are available:</p>
            {ul}
            {p}
            {ul2}
        </div>
    )
}
