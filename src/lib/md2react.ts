import React from "react"
import { default as rehype2react } from "rehype-react"
import { default as remark } from "remark-parse"
import { default as remark2rehype } from "remark-rehype"
import { default as unified } from "unified"

export let md2react = (markdownContent: string, replacementMap: any) => {
  let createElement = (component, ...args) => {
    let replacement = replacementMap[component] ?? component

    return React.createElement(replacement, ...args)
  }

  let processer = unified().use(remark).use(remark2rehype).use(rehype2react, { createElement })

  return processer.process(markdownContent).then(({ contents }) => contents)
}
