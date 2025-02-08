import { Button, Input } from "antd"

import { SingleCollapse } from "../SingleCollapse/SingleCollapse"
import "./NumberVariator.css"

export interface NumberVariatorProp {
  valueArray: number[]
  defaultOpen?: boolean
  onChange: (valueArray: number[]) => void
  titleVariationFunction: (k: number) => string
}

export let NumberVariator = (prop: NumberVariatorProp) => {
  let { valueArray, defaultOpen, onChange, titleVariationFunction } = prop

  return (
    <SingleCollapse label={`Variator (${valueArray.length} handles)`} defaultOpen={defaultOpen}>
      {valueArray.map((value, k) => {
        let titleVariation = titleVariationFunction(valueArray.length - 1 - k)
        return (
          <SingleVariator
            key={valueArray.length - 1 - k}
            value={value}
            onChange={(newValue) => {
              onChange([...valueArray.slice(0, k), newValue, ...valueArray.slice(k + 1)])
            }}
            titleIncrease={`- ${titleVariation}`}
            titleDecrease={`+ ${titleVariation}`}
          />
        )
      })}
    </SingleCollapse>
  )
}

export interface SingleVariatorProp {
  value: number
  onChange: (value: number) => void
  titleIncrease: string
  titleDecrease: string
}

export let SingleVariator = (prop: SingleVariatorProp) => {
  let { value, onChange, titleIncrease, titleDecrease } = prop

  return (
    <div className="singleVariator">
      <Button
        size="small"
        className="singleVariator__plusButton"
        onClick={() => {
          onChange(value + 1)
        }}
        title={titleIncrease}
      >
        +
      </Button>
      <Input
        className="singleVariator__input"
        onChange={(ev) => {
          onChange(Number(ev.target.value))
        }}
        value={value}
      />
      <Button
        size="small"
        className="singleVariator__minusButton"
        onClick={() => {
          onChange(value - 1)
        }}
        title={titleDecrease}
      >
        -
      </Button>
    </div>
  )
}
