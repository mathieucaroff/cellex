export interface HelpContentProp {
  list: [string, string][]
}

export let ShorcutList = (prop: HelpContentProp) => {
  let { list } = prop
  let longShortcutTableContent: React.ReactNode[] = []
  let shortShortcutTableContent: React.ReactNode[] = []

  let table = shortShortcutTableContent
  list.forEach((row, k) => {
    let [key, description] = row
    if (key.length > 1) {
      table = longShortcutTableContent
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
      <table className="shortShortcutTable">{shortShortcutTableContent}</table>
      <table className="longShortcutTable">{longShortcutTableContent}</table>
      <p>
        [*]moving the camera horizontally is only possible when the simulation is bigger than the
        camera. You can set the camera size (canvas size) in the Display menu, and set the
        simulation size in the Engine menu.
      </p>
      <p>[**]The space and enter shortcuts are only available while the display is selected.</p>
    </div>
  )
}
