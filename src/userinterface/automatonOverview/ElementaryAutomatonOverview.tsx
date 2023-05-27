import { AutomatonOverview } from "./AutomatonOverview"

export function ElementaryAutomatonOverview() {
  return (
    <div className="elementaryAutomatonOverview">
      {Array.from({ length: 256 }, (_, k) => {
        return (
          <div key={k}>
            <p>Rule {k}</p>
            <AutomatonOverview ruleName={`e${k}`} genesis="1(0)" width={100} height={100} />
            <AutomatonOverview ruleName={`e${k}`} genesis="([01])" width={100} height={100} />
          </div>
        )
      })}
    </div>
  )
}
