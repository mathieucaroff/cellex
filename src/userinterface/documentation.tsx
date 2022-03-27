import fs from "fs"
import * as React from "react"
import { md2react } from "../lib/md2react"
import { usePromise } from "../util/usePromise"

const markdownContent = fs.readFileSync(__dirname + "/../../DOCUMENTATION.md", "utf-8")

let promise = md2react(markdownContent, {}) // , { a: Link })

export let Documentation = () => {
    let tree = usePromise(() => "", promise)
    return (
        <section style={{ maxWidth: "700px", marginLeft: "60px", marginTop: "50px" }}>
            {tree}
        </section>
    )
}
