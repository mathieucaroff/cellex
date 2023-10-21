import { Typography } from "antd"
import { ReactNode } from "react"

import { SingleCollapse } from "../components/SingleLoadingCollapse/SingleLoadingCollapse"

const { Title } = Typography

export interface AutomatonGroupCommonProp {
  title: string
  doExpand?: boolean
}

export interface AutomatonGroupSimpleProp extends AutomatonGroupCommonProp {
  mode: "simple"
  children: ReactNode
}

export interface AutomatonGroupSmartProp extends AutomatonGroupCommonProp {
  mode: "smart"
  className?: string
  automatonPreviewArray: ReactNode[]
}

export type AutomatonGroupProp = AutomatonGroupSimpleProp | AutomatonGroupSmartProp

export function AutomatonGroup(prop: AutomatonGroupProp) {
  let { title, doExpand } = prop

  let children: ReactNode
  if (prop.mode === "simple") {
    children = prop.children
  } else {
    let { automatonPreviewArray, className } = prop
    title = `${title} (${automatonPreviewArray.length})`
    children = <div className={className}>{automatonPreviewArray}</div>
  }

  return (
    <>
      <Title level={4}>{title}</Title>
      <SingleCollapse ghost doExpand={doExpand}>
        {children}
      </SingleCollapse>
    </>
  )
}
