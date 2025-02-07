import { Engine } from "./Engine"
import { Palette } from "./Palette"
import { Topology } from "./Topology"

export let SettingsUI = () => {
  return (
    <div>
      <div className="settingsUiMenuColumn">
        <Engine />
      </div>
      <div className="settingsUiMenuColumn">
        <Topology />
      </div>
      <div className="settingsUiMenuColumn">
        <Palette />
      </div>
    </div>
  )
}
