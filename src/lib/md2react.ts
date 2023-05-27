import React, { ComponentType, ReactNode } from "react"
import { default as rehype2react } from "rehype-react"
import { default as remark } from "remark-parse"
import { default as remark2rehype } from "remark-rehype"
import { unified } from "unified"

export let md2react = (markdownContent: string, replacementMap: Record<string, ComponentType>) => {
  let createElement = (component: string, props, ...children: ReactNode[]) => {
    let replacement = replacementMap[component] ?? component

    return React.createElement(replacement, props, ...children)
  }

  let processer = unified().use(remark).use(remark2rehype).use(rehype2react, { createElement })

  return processer.process(markdownContent).then(({ value }) => value)
}
