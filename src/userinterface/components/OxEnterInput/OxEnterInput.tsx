import { Button, Input, Space } from "antd"
import { CSSProperties, useContext, useEffect, useState } from "react"

import { ReactContext } from "../../../state/ReactContext"
import { readPath, useStatePath } from "../../hooks"

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
  randomElementTitle?: string
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
    randomElementTitle,
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
          if (pv !== undefined) {
            context.updateState((state) => {
              let { piece, last } = readPath(path, state)
              piece[last] = p
            })
          }
        }}
        onPressEnter={() => {
          let p: any
          try {
            p = parse(localValue)
            present(p)
          } catch (e) {
            console.error(`Error parsing value ${localValue}: [[${e}]]`)
            return
          }

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
    </Space.Compact>
  )
}
