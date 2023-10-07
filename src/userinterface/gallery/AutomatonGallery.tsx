import { Collapse, Select, Typography } from "antd"
import { ReactNode, useState } from "react"

import {
  curated3ColorCodeArray,
  curatedNs3AutomatonArray,
  extraCurated3ColorCodeArray,
  interestingElementaryRuleSet,
  ruleSet,
} from "../../engine/automaton"
import { wolframClassInfo } from "../../engine/wolframClassInfo"
import { labelValue } from "../../util/labelValue"
import { SingleCollapse } from "../components/SingleLoadingCollapse/SingleLoadingCollapse"
import { AutomatonPreview } from "./AutomatonPreview"

const { Panel } = Collapse
const { Title } = Typography

const totalisticCodeOverview = (props: { neighborhoodSize: number }) => {
  let { neighborhoodSize } = props
  return Array.from({ length: 2 ** (neighborhoodSize + 1) }, (_, k) => {
    return (
      <AutomatonPreview
        key={k}
        descriptor={`ns${neighborhoodSize},c${k}`}
        automatonTitle={`ns ${neighborhoodSize}, code ${k}`}
      />
    )
  })
}

export function AutomatonGallery({ doOpenFirst }: { doOpenFirst?: boolean }) {
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

  return (
    <div className="automatonGallery">
      <Title level={4}>Curated Automata</Title>
      <SingleCollapse ghost doOpen={doOpenFirst}>
        <div className="curatedAutomata">
          {curatedNs3AutomatonArray
            .concat(curated3ColorCodeArray)
            .map(({ shorterLabel, label, value }) => (
              <AutomatonPreview
                key={value}
                tooltip={label}
                descriptor={value}
                automatonTitle={shorterLabel}
                genesisArray={["1(0)", "([012])"]}
              />
            ))}
        </div>
      </SingleCollapse>
      <Title level={4}>Extra curated 3-color Codes</Title>
      <SingleCollapse ghost>
        <div className="curatedAutomata">
          {extraCurated3ColorCodeArray.map(({ shorterLabel, label, value }) => (
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
        </div>
      </SingleCollapse>

      <Title level={4}>Elementary Automata</Title>
      <SingleCollapse ghost>
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
              style={{ width: 120 }}
            />
          </div>
        )}
        <div className="elementaryAutomatonOverview">{groupedElementaryAutomata}</div>
      </SingleCollapse>

      <Title level={4}>Totalistic code of neighborhood size 3</Title>
      <SingleCollapse ghost>
        <div className="totalisticCodeOverviewNs3">
          {totalisticCodeOverview({ neighborhoodSize: 3 })}
        </div>
      </SingleCollapse>

      <Title level={4}>Totalistic code of neighborhood size 5</Title>
      <SingleCollapse ghost>
        <div className="totalisticCodeOverviewNs5">
          {totalisticCodeOverview({ neighborhoodSize: 5 })}
        </div>
      </SingleCollapse>

      <Title level={4}>Totalistic code of neighborhood size 7</Title>
      <SingleCollapse ghost>
        <div className="totalisticCodeOverviewNs7">
          {totalisticCodeOverview({ neighborhoodSize: 7 })}
        </div>
      </SingleCollapse>

      <Title level={4}>Reversible Elementary Automata</Title>
      <SingleCollapse ghost>
        <div>
          {Array.from({ length: 256 }, (_, k) => (
            <AutomatonPreview
              key={k}
              descriptor={`re${k}`}
              automatonTitle={`Reversible rule ${k}`}
              genesisArray={["1(0)", "([01])", "([0{9}1])"]}
            />
          ))}
        </div>
      </SingleCollapse>

      <Title level={4}>Reversible totalistic code of neighborhood size 3</Title>
      <SingleCollapse ghost>
        <div>
          {Array.from({ length: 16 }, (_, k) => (
            <AutomatonPreview
              key={k}
              descriptor={`rc${k}`}
              automatonTitle={`Reversible code ${k}`}
              genesisArray={["1(0)", "([01])", "([0{9}1])"]}
            />
          ))}
        </div>
      </SingleCollapse>

      <Title level={4}>Reversible totalistic code of neighborhood size 5</Title>
      <SingleCollapse ghost>
        <div>
          {Array.from({ length: 64 }, (_, k) => (
            <AutomatonPreview
              key={k}
              descriptor={`ns5,rc${k}`}
              automatonTitle={`Reversible code ${k}`}
              genesisArray={["1(0)", "([01])", "([0{9}1])"]}
            />
          ))}
        </div>
      </SingleCollapse>

      <Title level={4}>Reversible totalistic code of neighborhood size 7</Title>
      <SingleCollapse ghost>
        <div>
          {Array.from({ length: 256 }, (_, k) => (
            <AutomatonPreview
              key={k}
              descriptor={`ns7,rc${k}`}
              automatonTitle={`Reversible code ${k}`}
              genesisArray={["1(0)", "([01])", "([0{9}1])"]}
            />
          ))}
        </div>
      </SingleCollapse>
    </div>
  )
}
