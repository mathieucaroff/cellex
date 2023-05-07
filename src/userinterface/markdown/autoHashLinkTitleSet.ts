import * as React from "react"

export let autoHashLinkingTitleSet = Object.fromEntries(
  "h1 h2 h3 h4 h5 h6".split(" ").map((key) => [
    key,
    (prop: { children: string }) => {
      let textContent = "" + prop.children

      let id = textContent.toLowerCase().replace(/\s/g, "-")

      return React.createElement(key, { id }, prop.children)
    },
  ]),
)
