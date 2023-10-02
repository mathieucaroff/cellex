import { LoadingOutlined } from "@ant-design/icons"
import { Collapse, CollapseProps } from "antd"
import { useEffect, useState } from "react"

export interface SingleCollapseProp extends Omit<CollapseProps, "activeKey"> {
  children: React.ReactNode | React.ReactNode[]
  label?: React.ReactNode
  doOpen?: boolean
}

export function SingleCollapse(prop: SingleCollapseProp) {
  let { children, doOpen = false, label = "Click to expand/collapse", ...remainingProp } = prop
  let [open, setOpen] = useState(false)
  let [loading, setLoading] = useState(false)
  let openTimeout: ReturnType<typeof setTimeout>

  useEffect(() => {
    if (doOpen && !open) {
      setOpen(true)
    }
  }, [doOpen, open])

  useEffect(() => {
    return () => {
      clearTimeout(openTimeout)
    }
  }, [])

  return (
    <Collapse
      onChange={() => {
        if (!open) {
          setLoading(true)
          openTimeout = setTimeout(() => {
            setOpen(true)
            setLoading(false)
          })
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
