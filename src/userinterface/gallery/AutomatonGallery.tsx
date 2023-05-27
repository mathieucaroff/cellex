import { curatedLargeAutomatonArray } from "../RuleCascader"
import { AutomatonPreview } from "./AutomatonPreview"

export function AutomatonGallery() {
  return (
    <div className="automatonGallery">
      <h2>Curated Large Automata</h2>
      <div className="curatedLargeAutomata">
        {curatedLargeAutomatonArray.map(({ shorterLabel, value }) => (
          <AutomatonPreview key={value} descriptor={value} automatonTitle={shorterLabel} />
        ))}
      </div>
      <h2>Elementary Automata</h2>
      <div className="elementaryAutomatonOverview">
        {Array.from({ length: 256 }, (_, k) => {
          return <AutomatonPreview key={k} descriptor={`e${k}`} automatonTitle={`Rule ${k}`} />
        })}
      </div>
    </div>
  )
}
