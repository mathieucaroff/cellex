import { ReactMarkdown } from "react-markdown/lib/react-markdown"

// @ts-ignore
import markdownContent from "../../../DOCUMENTATION.md?raw"
import { autoHashLinkingTitleSet } from "./autoHashLinkTitleSet"

export let Documentation = () => {
  return (
    <section style={{ maxWidth: "700px", marginLeft: "60px", marginTop: "50px" }}>
      <ReactMarkdown children={markdownContent} components={{ ...autoHashLinkingTitleSet }} />
    </section>
  )
}

export let DocumentationPhone = () => {
  return (
    <section className="phonePopupContent">
      <ReactMarkdown children={markdownContent} components={{ ...autoHashLinkingTitleSet }} />
    </section>
  )
}
