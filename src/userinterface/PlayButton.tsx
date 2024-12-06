import { PauseCircleOutlined, PlayCircleOutlined } from "@ant-design/icons"
import { Button } from "antd"
import { useContext } from "react"

import { ReactContext } from "../state/ReactContext"
import { useStateSelection } from "./hooks"

export function PlayButton() {
  let { act } = useContext(ReactContext)
  let play = useStateSelection(({ play }) => play)

  return (
    <Button
      type="primary"
      title={play ? "pause" : "play"}
      icon={play ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
      onClick={() => act.togglePlay()}
    />
  )
}
