import { Button, Input, InputNumber, Select, Space } from "antd"
import Checkbox from "antd/lib/checkbox/Checkbox"
import { CSSProperties, useContext, useEffect, useState } from "react"

import { ReactContext } from "../state/ReactContext"
import { readPath, useStatePath } from "./hooks"

const { Option } = Select

interface OxInputProp {
  path: string
  disabled?: boolean
  style?: CSSProperties
  present?: (x: any) => string
  parse?: (y: string) => any
}

// OxInput an input tied to a value of the state
export function OxInput(prop: OxInputProp) {
  let { disabled, path, present = (x) => x, parse = (y) => y, style = {} } = prop
  let { context } = useContext(ReactContext)
  let { piece, last } = useStatePath(path)

  return (
    <Input
      style={{ width: "73%", ...style }}
      disabled={disabled}
      value={present(piece[last])}
      onChange={(ev) => {
        context.updateState((state) => {
          let { piece, last } = readPath(path, state)
          piece[last] = parse(ev.target.value)
        })
      }}
    />
  )
}

interface OxEnterInputProp {
  path: string
  id?: string
  title?: string
  disabled?: boolean
  style?: CSSProperties
  present?: (x: any) => string
  parse?: (y: string) => any
  // randomizer is a way to get a random value written to the state
  randomizer?: () => any
  // randomizer2 is a second way to get a random value
  randomizer2?: () => any
  randomElementTitle?: string
  randomElementTitle2?: string
  extraOnPressEnter?: () => void
}

// OxEnterInput an input which maps to the value of the path of the state
// It saves either when Enter is pressed or when the input matches perfectly
// the result of a round trip through the adaptor functions
export function OxEnterInput(prop: OxEnterInputProp) {
  let {
    path,
    id,
    title,
    disabled,
    present = (x) => x,
    parse = (y) => y,
    style = {},
    randomizer,
    randomizer2,
    randomElementTitle,
    randomElementTitle2,
    extraOnPressEnter,
  } = prop

  let { context } = useContext(ReactContext)
  let { piece, last } = useStatePath(path)
  let [localValue, setValue] = useState(() => present(piece[last]))
  let [isFocused, setIsFocused] = useState(false)

  let p: string
  useEffect(() => {
    if (!isFocused && localValue !== p) {
      setValue(p)
    }
  }, [isFocused || (p = present(piece[last]))])

  let randomElement = randomizer ? (
    <Button
      icon={"🎲"}
      title={randomElementTitle}
      onClick={() => {
        context.updateState((state) => {
          let { piece, last } = readPath(path, state)
          piece[last] = randomizer!()
          setValue(present(piece[last]))
        })
      }}
    />
  ) : null

  let randomElement2 = randomizer2 ? (
    <Button
      icon={"🎲"}
      title={randomElementTitle2}
      onClick={() => {
        context.updateState((state) => {
          let { piece, last } = readPath(path, state)
          piece[last] = randomizer2!()
          setValue(present(piece[last]))
        })
      }}
    />
  ) : null

  return (
    <Space.Compact>
      <Input
        id={id}
        style={style}
        title={title}
        name={path}
        disabled={disabled}
        value={localValue}
        onChange={(ev) => {
          let v = ev.target.value
          setValue(v)
          let p: any
          let pv: any
          try {
            p = parse(v)
            pv = present(p)
          } catch {}
          if (pv === v) {
            context.updateState((state) => {
              let { piece, last } = readPath(path, state)
              piece[last] = p
            })
          }
        }}
        onPressEnter={() => {
          context.updateState((state) => {
            let { piece, last } = readPath(path, state)
            piece[last] = parse(localValue)
          })
          setValue(present(piece[last]))
          extraOnPressEnter?.()
        }}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
      />
      {randomElement}
      {randomElement2}
    </Space.Compact>
  )
}

interface OxInputNumberProp {
  path: string
}

// OxInputNumber an input tied to a numeric value of the state
export function OxInputNumber(prop: OxInputNumberProp) {
  let { path } = prop
  let { context } = useContext(ReactContext)
  let { piece, last } = useStatePath(path)

  return (
    <InputNumber
      value={piece[last]}
      onChange={(value) => {
        context.updateState((state) => {
          let { piece, last } = readPath(path, state)
          piece[last] = value
        })
      }}
    ></InputNumber>
  )
}

interface OxSelectProp {
  path: string
  valueArray: string[]
  disabled?: boolean
}

// OxSelect a select input
export function OxSelect(prop: OxSelectProp) {
  let { path, disabled, valueArray } = prop
  let { context } = useContext(ReactContext)
  let { piece, last } = useStatePath(path)

  return (
    <Select
      disabled={disabled}
      value={piece[last]}
      onChange={(value) => {
        context.updateState((state) => {
          let { piece, last } = readPath(path, state)
          piece[last] = value
        })
      }}
    >
      {valueArray.map((v) => (
        <Option value={v} key={v}>
          {v}
        </Option>
      ))}
    </Select>
  )
}

interface OxButtonProp {
  path: string
  icon: React.ReactNode
  disabled?: boolean
  half?: boolean
  double?: boolean
}

// OxButton
export function OxButton(prop: OxButtonProp) {
  let { path, icon, disabled, half, double } = prop
  let { context } = useContext(ReactContext)

  let buttonParameter: any = { icon, disabled }

  if (half || double) {
    let ratio = half ? 1 / 2 : 2
    buttonParameter.onClick = (ev) => {
      context.updateState((state) => {
        let { piece, last } = readPath(path, state)
        piece[last] *= ratio
      })
    }
  }

  return <Button {...buttonParameter} />
}

interface OxCheckboxProp {
  path: string
  disabled: boolean
}

// OxCheckbox is a checkbox input tied to a boolean value of the state
export function OxCheckbox(prop: OxCheckboxProp) {
  let { path, disabled } = prop
  let { context } = useContext(ReactContext)
  let { piece, last } = useStatePath(path)

  return (
    <Checkbox
      disabled={disabled}
      checked={piece[last]}
      onChange={(ev) => {
        context.updateState((state) => {
          let { piece, last } = readPath(path, state)
          piece[last] = ev.target.checked
        })
      }}
    ></Checkbox>
  )
}
