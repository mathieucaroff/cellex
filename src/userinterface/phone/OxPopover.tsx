import { Button, Popover, PopoverProps } from "antd"

export interface PhonePopoverProps extends Omit<PopoverProps, "content" | "placement" | "trigger"> {
  content: React.ReactNode
  title: string
  icon?: React.ReactNode
}

export function OxPopover(props: PhonePopoverProps) {
  let { title, icon, children, ...rest } = props
  if (!children) {
    children = (
      <Button>
        <i style={{ marginRight: "8px" }}>{icon}</i>
        {title}
      </Button>
    )
  }

  return (
    <Popover
      {...rest}
      children={children}
      placement="top"
      content={<div className="phonePopupContentWrapper">{props.content}</div>}
      trigger="click"
    />
  )
}
