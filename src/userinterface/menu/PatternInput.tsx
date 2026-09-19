import { DeleteOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Input, Select } from "antd"
import { useContext, useEffect, useState } from "react"

import { Pattern, PatternColor, PatternWithColor } from "../../patternlang/PatternType"
import { parsePatternList } from "../../patternlang/parser"
import { presentPattern } from "../../patternlang/presenter"
import { ReactContext } from "../../state/ReactContext"
import { useStateSelection } from "../hooks"

const patternColors: PatternColor[] = ["red", "green", "blue", "cyan", "magenta", "yellow"]

const patternColorOptions: { value: PatternColor; label: React.ReactNode }[] = patternColors.map(
  (color) => ({
    value: color,
    label: <span className={`patternColorSwatch patternColorSwatch--${color}`} title={color} />,
  }),
)

function PatternRow({
  patternWithColor,
  index,
}: {
  patternWithColor: PatternWithColor
  index: number
}) {
  let { context } = useContext(ReactContext)
  let { pattern } = patternWithColor
  let displayedValue = pattern ? presentPattern(pattern) : ""
  let [value, setValue] = useState(displayedValue)
  let [invalid, setInvalid] = useState(false)
  let [pendingPattern, setPendingPattern] = useState<Pattern>()

  useEffect(() => {
    setValue(displayedValue)
    setInvalid(false)
  }, [displayedValue])

  useEffect(() => {
    if (!pendingPattern) {
      return
    }

    let timeout = setTimeout(() => {
      context.updateState((state) => {
        state.patternList = state.patternList.map((patternWithColor, patternIndex) =>
          patternIndex === index
            ? { ...patternWithColor, pattern: pendingPattern }
            : patternWithColor,
        )
      })
    }, 300)
    return () => clearTimeout(timeout)
  }, [context, index, pendingPattern])

  return (
    <div className="patternDeclaration">
      <Input
        aria-label={`Pattern ${index + 1}`}
        placeholder="!1, ^111, =0011, #01"
        status={invalid ? "error" : undefined}
        value={value}
        onChange={(event) => {
          let { value } = event.target
          setValue(value)
          try {
            let parsed = parsePatternList(`${value}:${patternWithColor.color}`)[0]
            setPendingPattern(parsed.pattern)
            setInvalid(false)
          } catch {
            setPendingPattern(undefined)
            setInvalid(true)
          }
        }}
      />
      <Select
        aria-label={`Pattern ${index + 1} color`}
        className="patternDeclaration__color"
        value={patternWithColor.color}
        options={patternColorOptions}
        onChange={(color: PatternColor) => {
          context.updateState((state) => {
            state.patternList = state.patternList.map((pattern, patternIndex) =>
              patternIndex === index ? { ...pattern, color } : pattern,
            )
          })
        }}
      />
      <Button
        aria-label={`Delete pattern ${index + 1}`}
        icon={<DeleteOutlined />}
        onClick={() => {
          context.updateState((state) => {
            state.patternList = state.patternList.filter(
              (_, patternIndex) => patternIndex !== index,
            )
          })
        }}
      />
    </div>
  )
}

export function PatternInput() {
  let { context } = useContext(ReactContext)
  let patternList = useStateSelection(({ patternList }) => patternList)

  return (
    <div className="patternDeclarations">
      {patternList.map((patternWithColor, index) => (
        <PatternRow key={index} {...{ patternWithColor, index }} />
      ))}
      <Button
        aria-label="Add pattern"
        icon={<PlusOutlined />}
        onClick={() => {
          context.updateState((state) => {
            state.patternList = [...state.patternList, { color: "red" }]
          })
        }}
      />
    </div>
  )
}
