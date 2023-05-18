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
        <td>
          <kbd>{key}</kbd>
        </td>
        <td>{description}</td>
      </tr>,
    )
  })

  return (
    <div style={{ width: "600px" }}>
      <p>While the display is selected, the following shortcuts are available:</p>
      <table>{longShortcutTableContent}</table>
      <table>{shortShortcutTableContent}</table>
      <p>
        [*]moving the camera horizontally is only possible when the simulation is bigger than the
        camera. You can set the camera size (canvas size) in the Display menu, and set the
        simulation size in the Engine menu.
      </p>
      <p>
        At the bottom right corner of each canvas, there is a hidden handle which allows to resize
        the canvas.
      </p>
    </div>
  )
}
