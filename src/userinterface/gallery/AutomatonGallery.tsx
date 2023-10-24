import { Collapse, Select } from "antd"
import { ReactNode, useState } from "react"

import {
  curated3ColorCodeArray,
  curatedNs3AutomatonArray,
  extraCurated3ColorCodeArray,
  interestingElementaryRuleSet,
  ruleSet,
} from "../../engine/curatedAutomata"
import { wolframClassInfo } from "../../engine/misc/wolframClassInfo"
import { labelValue } from "../../util/labelValue"
import { AutomatonGroup } from "./AutomatonGroup"
import { AutomatonPreview } from "./AutomatonPreview"

const { Panel } = Collapse

const totalisticCodePreviewArray = (props: { neighborhoodSize: number; reversible?: boolean }) => {
  let { neighborhoodSize, reversible = false } = props
  let r = reversible ? "r" : ""
  let genesisArray = ["1(0)", "([01])", "([0{9}1])"]

  return Array.from({ length: 2 ** (neighborhoodSize + 1) }, (_, k) => {
    let descriptor = `ns${neighborhoodSize},${r}c${k}`
    let title = `ns ${neighborhoodSize}, ${r ? "reversible " : ""}code ${k}`

    return (
      <AutomatonPreview
        key={k}
        descriptor={descriptor}
        automatonTitle={title}
        genesisArray={genesisArray}
      />
    )
  })
}

function elementaryAutomatonPreview(k: number) {
  return (
    <AutomatonPreview
      key={k}
      descriptor={`e${k}`}
      automatonTitle={`Rule ${k}`}
      genesisArray={["1(0)", "([01])", "([0{9}1])"]}
    />
  )
}

function elementarAutomatonLine(line: number[], k) {
  return <div key={k}>{line.map(elementaryAutomatonPreview)}</div>
}

/** AutomatonGallery displays the gallery of automata */
export function AutomatonGallery({ doExpandFirst }: { doExpandFirst?: boolean }) {
  // Filtering
  let [currentEAFilter, setEAFilter] = useState("All")
  let elementaryAutomataFilterOptionArray = Object.keys(interestingElementaryRuleSet).map((k) => ({
    label: k,
    value: k,
  }))
  elementaryAutomataFilterOptionArray.unshift(labelValue("All"))

  let currentEAFilterSet: number[]
  if (currentEAFilter === "All") {
    currentEAFilterSet = Array.from({ length: 256 }, (_, k) => k)
  } else if (interestingElementaryRuleSet[currentEAFilter]) {
    currentEAFilterSet = interestingElementaryRuleSet[currentEAFilter]
  } else {
    throw new Error("unknown filter " + currentEAFilter)
  }

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
  } else if (currentEAGrouping === "Wolfram Classes") {
    groupedElementaryAutomata = (
      <Collapse className="groupedElementaryAutomataWolframClasses">
        {Object.entries(wolframClassInfo).map(([name, ruleArray]) => (
          <Panel key={name} header={`${name} (${ruleArray.length} rules)`}>
            {ruleArray.map(elementaryAutomatonPreview)}
          </Panel>
        ))}
      </Collapse>
    )
  }

  let curatedAutomata = curatedNs3AutomatonArray.concat(curated3ColorCodeArray)

  return (
    <div className="automatonGallery">
      <AutomatonGroup
        title={`Curated Automata (${curatedAutomata.length})`}
        mode="simple"
        doExpand={doExpandFirst}
      >
        <div className="curatedAutomata">
          {curatedAutomata.map(({ shorterLabel, label, value }) => (
            <AutomatonPreview
              key={value}
              tooltip={label}
              descriptor={value}
              automatonTitle={shorterLabel}
              genesisArray={["1(0)", "([012])", "([0{9}1])"]}
            />
          ))}
        </div>
      </AutomatonGroup>

      <AutomatonGroup
        title={`Extra curated 3-color Codes`}
        mode="smart"
        className="curatedAutomata"
        automatonPreviewArray={extraCurated3ColorCodeArray.map(({ shorterLabel, label, value }) => (
          <AutomatonPreview
            key={value}
            tooltip={label}
            descriptor={value}
            automatonTitle={shorterLabel}
            genesisArray={["([012])"]}
            width={140}
            height={140}
          />
        ))}
      />

      <AutomatonGroup title="Elementary Automata (256)" mode="simple">
        <div>
          <strong>Grouping </strong>
          <Select
            value={currentEAGrouping}
            options={["None", "Symmetries", "Wolfram Classes"].map(labelValue)}
            onChange={(value) => {
              setEAGrouping(value)
            }}
            style={{ width: 160 }}
          />
        </div>
        {currentEAGrouping === "None" && (
          <div>
            <strong>Filtering </strong>
            <Select
              value={currentEAFilter}
              options={elementaryAutomataFilterOptionArray}
              onChange={(value) => {
                setEAFilter(value)
              }}
              style={{ width: 160 }}
            />
          </div>
        )}
        <div className="elementaryAutomatonOverview">{groupedElementaryAutomata}</div>
      </AutomatonGroup>

      <AutomatonGroup
        title="Reversible Elementary Automata"
        mode="smart"
        automatonPreviewArray={Array.from({ length: 256 }, (_, k) => (
          <AutomatonPreview
            key={k}
            descriptor={`re${k}`}
            automatonTitle={`Reversible rule ${k}`}
            genesisArray={["1(0)", "([01])", "([0{9}1])"]}
          />
        ))}
      />

      <AutomatonGroup
        title="Totalistic code of neighborhood size 3"
        mode="smart"
        automatonPreviewArray={totalisticCodePreviewArray({ neighborhoodSize: 3 })}
      />

      <AutomatonGroup
        title="Reversible totalistic code of neighborhood size 3"
        mode="smart"
        automatonPreviewArray={totalisticCodePreviewArray({
          neighborhoodSize: 3,
          reversible: true,
        })}
      />

      <AutomatonGroup
        title="Totalistic code of neighborhood size 5"
        mode="smart"
        automatonPreviewArray={totalisticCodePreviewArray({ neighborhoodSize: 5 })}
      />

      <AutomatonGroup
        title="Reversible totalistic code of neighborhood size 5"
        mode="smart"
        automatonPreviewArray={totalisticCodePreviewArray({
          neighborhoodSize: 5,
          reversible: true,
        })}
      />

      <AutomatonGroup
        title="Totalistic code of neighborhood size 7"
        mode="smart"
        automatonPreviewArray={totalisticCodePreviewArray({ neighborhoodSize: 7 })}
      />

      <AutomatonGroup
        title="Reversible totalistic code of neighborhood size 7"
        mode="smart"
        automatonPreviewArray={totalisticCodePreviewArray({
          neighborhoodSize: 7,
          reversible: true,
        })}
      />
    </div>
  )
}
