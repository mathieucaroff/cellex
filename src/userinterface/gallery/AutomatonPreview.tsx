import { Tooltip } from "antd"

import { AutomatonCanvas } from "./AutomatonCanvas"

export interface AutomatonPreviewProp {
  /** Title for the automaton. Always visible. */
  automatonTitle?: string
  /** Automaton name */
  descriptor: string
  /** Genesis descriptors. One canvas will be displayed for each genesis */
  genesisArray: string[]
  /** width of the canvas-es */
  width?: number
  /** height of the canvas-es */
  height?: number
}

export function AutomatonPreview(props: AutomatonPreviewProp) {
  let { descriptor, automatonTitle = descriptor, genesisArray, width = 100, height = 100 } = props

  return (
    <span className="automatonPreview">
      <p>{automatonTitle}</p>
      {genesisArray.map((genesis, k) => (
        <AutomatonCanvas
          key={k}
          descriptor={descriptor}
          genesis={genesis}
          width={width}
          height={height}
          title={true ? (genesisArray.length > 1 ? genesis : "") : undefined}
        />
      ))}
    </span>
  )
}
