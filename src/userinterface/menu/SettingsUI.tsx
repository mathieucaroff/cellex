import { Divider } from "antd"

import { Display } from "./Display"
import { Engine } from "./Engine"
import { MiscSettings } from "./MiscSettings"
import { Palette } from "./Palette"
import { Topology } from "./Topology"

export let SettingsUI = () => {
  return (
    <div>
      <div className="settingsUiMenuColumn">
        <Engine />
        <Divider />
        <Display />
      </div>
      <div className="settingsUiMenuColumn">
        <Topology />
        <Divider />
        <MiscSettings />
      </div>
      <div className="settingsUiMenuColumn">
        <Palette />
      </div>
    </div>
  )
}
