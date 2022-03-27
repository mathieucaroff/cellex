import * as React from "react"

export let ReactTitleWithAutomaticAnchorSet = Object.fromEntries(
    "h1 h2 h3 h4 h5 h6".split(" ").map((key) => [
        key,
        (prop: { children: string }) => {
            let tag = key
            let id = ("" + prop.children).toLowerCase().replace(/\s/g, "-")
            return React.createElement(tag, { id }, prop.children)
        },
    ]),
)
