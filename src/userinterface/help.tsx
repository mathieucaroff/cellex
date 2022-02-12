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
    return <div>{ul}</div>
}
