import { AutomatonCanvas } from "./AutomatonCanvas"

export interface AutomatonPreviewProp {
  automatonTitle?: string
  descriptor: string
}

export function AutomatonPreview(props: AutomatonPreviewProp) {
  let { descriptor, automatonTitle = descriptor } = props

  return (
    <div className="automatonPreview">
      <p>{automatonTitle}</p>
      <AutomatonCanvas ruleName={descriptor} genesis="1(0)" width={100} height={100} />
      <AutomatonCanvas ruleName={descriptor} genesis="([01])" width={100} height={100} />
    </div>
  )
}
