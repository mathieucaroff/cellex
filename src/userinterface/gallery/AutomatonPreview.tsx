import { Tooltip } from "antd"

import { AutomatonCanvas } from "./AutomatonCanvas"

export interface AutomatonPreviewProp {
  automatonTitle?: string
  descriptor: string
  title?: string
  genesisArray?: string[]
  width?: number
  height?: number
}

export function AutomatonPreview(props: AutomatonPreviewProp) {
  let {
    descriptor,
    title,
    automatonTitle = descriptor,
    genesisArray = ["1(0)", "([01])"],
    width = 100,
    height = 100,
  } = props

  return (
    <Tooltip className="automatonPreview inline" title={title}>
      <p>{automatonTitle}</p>
      {genesisArray.map((g, k) => (
        <AutomatonCanvas
          key={k}
          descriptor={descriptor}
          genesis={g}
          width={width}
          height={height}
        />
      ))}
    </Tooltip>
  )
}
