import { InfoCircleOutlined } from "@ant-design/icons"
import { Button, Input, InputRef, Space, Tooltip } from "antd"
import { CSSProperties, createRef, useContext, useEffect, useState } from "react"

import { ReactContext } from "../../../state/ReactContext"
import { readPath, useStatePath } from "../../hooks"
import "./OxEnterInput.css"

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
  miniLabel?: string
  lax?: boolean
}

/** OxEnterInput is an input which maps to the value of the path of the state
 * It saves either when Enter is pressed or when the input matches perfectly
 * the result of a round trip through the adaptor functions */
export function OxEnterInput(prop: OxEnterInputProp) {
  let {
    path,
    id,
    title,
    disabled,
    present = (x: any): string => x,
    parse = (y: string): any => y,
    style = {},
    randomizer,
    randomElementTitle,
    extraOnPressEnter,
    miniLabel,
    lax,
  } = prop

  let { context } = useContext(ReactContext)
  let { piece, last } = useStatePath(path)
  let [localValue, setValue] = useState(() => present(piece[last]))
  let [isFocused, setIsFocused] = useState(false)
  let [error, setError] = useState("")
  let ref = createRef<InputRef>()

  // Handle external updates to piece[last]
  let p: string
  useEffect(() => {
    if (!isFocused && localValue !== p) {
      setValue(p)
    }
  }, [isFocused || (p = present(piece[last]))])

  // Handle auto-save
  useEffect(() => {
    let p: any
    let pv: string
    try {
      p = parse(localValue)
      pv = present(p)
    } catch (e) {
      if (e.info !== undefined) {
        setError(e.info)
      } else {
        setError(String(e))
      }
    }
    if (pv !== undefined) {
      setError("")
    }
    if (pv === localValue || (pv !== undefined && lax)) {
      context.updateState((state) => {
        let { piece, last } = readPath(path, state)
        piece[last] = p
      })
    }
  }, [localValue])

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
    <Space.Compact className="oxEnterInputContainer">
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
        ref={ref}
        status={error && "error"}
        prefix={<label className="miniLabel">{miniLabel}</label>}
        suffix={<Tooltip title={error}>{error && <InfoCircleOutlined />}</Tooltip>}
      />
      {randomElement}
    </Space.Compact>
  )
}
