import { LoadingOutlined } from "@ant-design/icons"
import { Collapse, CollapseProps } from "antd"
import { useEffect, useState } from "react"

export interface SingleCollapseProp extends Omit<CollapseProps, "activeKey"> {
  children: React.ReactNode | React.ReactNode[]
  /** the text to use to tell the user that clicking expands or collapses the
   * view */
  label?: React.ReactNode
  /** doExpand is a way to force-open the collapse. The collapse cannot be closed
   * while this parameter is true. */
  doExpand?: boolean
}

export function SingleCollapse(prop: SingleCollapseProp) {
  let { children, doExpand = false, label = "Click to expand/collapse", ...remainingProp } = prop
  let [open, setOpen] = useState(false)
  let [loading, setLoading] = useState(false)
  let openTimeout: ReturnType<typeof setTimeout>

  useEffect(() => {
    if (doExpand && !open) {
      setOpen(true)
    }
  }, [doExpand, open])

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
          }, 50)
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
