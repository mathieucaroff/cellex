import { Collapse, Select } from "antd"
import { ReactNode, useState } from "react"

import { interestingElementaryRuleSet, ruleSet } from "../../engine/rule"
import { labelValue } from "../../util/labelValue"
import { curatedLargeAutomatonArray } from "../RuleCascader"
import { AutomatonPreview } from "./AutomatonPreview"

const { Panel } = Collapse

export function AutomatonGallery() {
  const elementaryAutomatonPreview = (k: number) => (
    <AutomatonPreview key={k} descriptor={`e${k}`} automatonTitle={`Rule ${k}`} />
  )
  const elementarAutomatonLine = (line: number[], k) => {
    return <div key={k}>{line.map(elementaryAutomatonPreview)}</div>
  }

  // Filtering
  let [currentEAFilter, setEAFilter] = useState("All")
  let elementaryAutomataFilterOptionArray = Object.keys(interestingElementaryRuleSet).map((k) => ({
    label: k,
    value: k,
  }))
  elementaryAutomataFilterOptionArray.unshift({ label: "All", value: "All" })

  let currentEAFilterSet: number[] =
    interestingElementaryRuleSet[currentEAFilter] ?? Array.from({ length: 256 }, (_, k) => k)

  // Grouping
  let [currentEAGrouping, setEAGrouping] = useState("None")
  let groupedElementaryAutomata: ReactNode
  if (currentEAGrouping === "None") {
    groupedElementaryAutomata = currentEAFilterSet.map(elementaryAutomatonPreview)
  } else if (currentEAGrouping === "Symmetries") {
    groupedElementaryAutomata = (
      <Collapse className="groupedElementaryAutomata">
        <Panel
          key="both"
          header={`Single rules (both left-right symmetric and color symmetric, ${ruleSet.both.length} in
          total)`}
        >
          {[ruleSet.both].map(elementarAutomatonLine)}
        </Panel>
        <Panel
          key="leftright"
          header={`Pairs of color symmetric rules (${ruleSet.leftright.length * 2} in total)`}
        >
          {ruleSet.leftright.map(elementarAutomatonLine)}
        </Panel>
        <Panel
          key="leftrightcolor"
          header={`Pairs left-right-color symmetric rules (${
            ruleSet.leftrightcolor.length * 2
          } in total)`}
        >
          {ruleSet.leftrightcolor.map(elementarAutomatonLine)}
        </Panel>
        <Panel
          key="color"
          header={`Pairs of left-right symmetric rules (${ruleSet.color.length * 2} in total)`}
        >
          {ruleSet.color.map(elementarAutomatonLine)}
        </Panel>
        <Panel
          key="four"
          header={`Group of four ordinary rules (${ruleSet.four.length * 4} in total)`}
        >
          {ruleSet.four.map(elementarAutomatonLine)}
        </Panel>
      </Collapse>
    )
  }

  return (
    <div className="automatonGallery">
      <h2>Curated Large Automata</h2>
      <div className="curatedLargeAutomata">
        {curatedLargeAutomatonArray.map(({ shorterLabel, value }) => (
          <AutomatonPreview key={value} descriptor={value} automatonTitle={shorterLabel} />
        ))}
      </div>
      <h2>Elementary Automata</h2>
      <div>
        {" "}
        <strong>Grouping </strong>
        <Select
          value={currentEAGrouping}
          options={["None", "Symmetries"].map(labelValue)}
          onChange={(value) => {
            console.log("value", value)
            setEAGrouping(value)
          }}
          style={{ width: 120 }}
        />
      </div>
      {currentEAGrouping === "None" && (
        <div>
          <strong>Filtering </strong>
          <Select
            value={currentEAFilter}
            options={elementaryAutomataFilterOptionArray}
            onChange={(value) => {
              console.log("value", value)
              setEAFilter(value)
            }}
            style={{ width: 120 }}
          />
        </div>
      )}
      <div className="elementaryAutomatonOverview">{groupedElementaryAutomata}</div>
    </div>
  )
}
