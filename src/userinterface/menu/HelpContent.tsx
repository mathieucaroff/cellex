export interface HelpContentProp {
  helpList: [string, string][]
}

export let HelpContent = (prop: HelpContentProp) => {
  let { helpList } = prop
  let longShortcutTableContent: React.ReactNode[] = []
  let shortShortcutTableContent: React.ReactNode[] = []
  let table = longShortcutTableContent

  helpList.forEach((row, k) => {
    let [key, description] = row
    if (key.length === 1) {
      table = shortShortcutTableContent
    }
    table.push(
      <tr key={k}>
        <th>
          <kbd>{key}</kbd>
        </th>
        <td>{description}</td>
      </tr>,
    )
  })

  return (
    <div style={{ width: "600px" }}>
      <p>The following shortcuts are available:</p>
      <table className="longShortcutTable">{longShortcutTableContent}</table>
      <table className="shortShortcutTable">{shortShortcutTableContent}</table>
      <p>
        [*]moving the camera horizontally is only possible when the simulation is bigger than the
        camera. You can set the camera size (canvas size) in the Display menu, and set the
        simulation size in the Engine menu.
      </p>
      <p>[**]The space and enter shortcuts are only available while the display is selected.</p>
    </div>
  )
}
