import { LoadingOutlined } from "@ant-design/icons"
import { Collapse, CollapseProps } from "antd"
import { useEffect, useState } from "react"

export interface SingleCollapseProp extends Omit<CollapseProps, "activeKey"> {
  children: React.ReactNode | React.ReactNode[]
  label?: React.ReactNode
  defaultIsOpen?: boolean
}

export function SingleCollapse(prop: SingleCollapseProp) {
  let {
    children,
    defaultIsOpen = false,
    label = "Click to expand/collapse",
    ...remainingProp
  } = prop
  let [open, setOpen] = useState(defaultIsOpen)
  let [loading, setLoading] = useState(false)
  let loadingTimeout: ReturnType<typeof setTimeout>
  let openTimeout: ReturnType<typeof setTimeout>

  useEffect(() => {
    return () => {
      clearTimeout(openTimeout)
      clearTimeout(loadingTimeout)
    }
  }, [])

  return (
    <Collapse
      onChange={() => {
        if (!open) {
          setLoading(true)
          openTimeout = setTimeout(() => {
            setOpen(true)
          }, 1)
          loadingTimeout = setTimeout(() => {
            setLoading(false)
          }, 2)
        } else {
          setOpen(false)
        }
      }}
      {...remainingProp}
      activeKey={open ? [1] : []}
      items={[
        {
          key: 1,
          label: (
            <>
              {label} {loading ? <LoadingOutlined /> : ""}
            </>
          ),
          children,
        },
      ]}
    />
  )
}
