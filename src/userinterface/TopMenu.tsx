import { DiffOutlined } from "@ant-design/icons"
import { Button, Popover } from "antd"

import { Act } from "../control/Act"
import { DiffMode } from "../diffType"
import { GalleryButton } from "./gallery/GalleryButton"
import { HelpContent } from "./menu/HelpContent"
import { SettingsUI } from "./menu/SettingsUI"

export interface TopMenuProp {
  diffMode: DiffMode
  helpList: [string, string][]
  act: Act
}

export let TopMenu = (prop: TopMenuProp) => {
  let { helpList, act, diffMode } = prop

  return (
    <div className="topMenu">
      <GalleryButton />

      <Popover placement="bottom" title="Settings" content={<SettingsUI />} trigger="click">
        <Button>
          <i className="fa fa-cog" />
          Settings
        </Button>
      </Popover>
      <Button
        type={diffMode.status !== "off" ? "primary" : "default"}
        title={"Toggle the Differential Mode " + (diffMode.status !== "off" ? "off" : "on")}
        icon={<DiffOutlined />}
        onClick={() => act.toggleDifferentialMode()}
      />
      <Popover placement="bottomLeft" content={<HelpContent helpList={helpList} />} trigger="click">
        <Button title="Help">?</Button>
      </Popover>
    </div>
  )
}
