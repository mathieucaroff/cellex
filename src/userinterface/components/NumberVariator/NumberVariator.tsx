import { Button, Input } from "antd"

import "./NumberVariator.css"

export interface NumberVariatorProp {
  valueArray: number[]
  onChange: (valueArray: number[]) => void
  titleIncreaseFunction: (k: number) => string
  titleDecreaseFunction: (k: number) => string
}

export let NumberVariator = (prop: NumberVariatorProp) => {
  let { valueArray, onChange, titleIncreaseFunction, titleDecreaseFunction } = prop
  return (
    <>
      {valueArray.map((value, k) => {
        return (
          <SingleVariator
            key={valueArray.length - 1 - k}
            value={value}
            onChange={(newValue) => {
              onChange([...valueArray.slice(0, k), newValue, ...valueArray.slice(k + 1)])
            }}
            titleIncrease={titleIncreaseFunction(valueArray.length - 1 - k)}
            titleDecrease={titleDecreaseFunction(valueArray.length - 1 - k)}
          />
        )
      })}
    </>
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
