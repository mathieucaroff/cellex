import { OxButton } from "../components/OxButton/OxButton"

export function SettingsPhoneUI() {
  return (
    <>
      <OxButton
        path="darkMode"
        switchValue={["dark", "light"]}
        className="themeSelect"
        title="Select a theme"
      >
        <i className="fa fa-sun-o" style={{ marginRight: "8px" }} />
        /
        <i className="fa fa-moon-o" style={{ marginLeft: "8px" }} />
      </OxButton>
    </>
  )
}
