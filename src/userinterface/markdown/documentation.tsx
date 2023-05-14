// @ts-ignore
import markdownContent from "../../../DOCUMENTATION.md?raw"
import { md2react } from "../../lib/md2react"
import { autoHashLinkingTitleSet } from "./autoHashLinkTitleSet"
import { usePromise } from "./usePromise"

// const markdownContent = fs.readFileSync(__dirname + "/../../../DOCUMENTATION.md", "utf-8")

let promise = md2react(markdownContent, { ...autoHashLinkingTitleSet })

export let Documentation = () => {
  let tree = usePromise(() => "", promise)
  return (
    <section style={{ maxWidth: "700px", marginLeft: "60px", marginTop: "50px" }}>{tree}</section>
  )
}
