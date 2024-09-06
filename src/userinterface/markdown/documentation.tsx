import { default as ReactMarkdown } from "react-markdown"

// @ts-ignore
import markdownContent from "../../../DOCUMENTATION.md"
import { autoHashLinkingTitleSet } from "./autoHashLinkTitleSet"

export let Documentation = () => {
  return (
    <section
      style={{ maxWidth: "700px", marginLeft: "60px", marginTop: "50px" }}
    >
      <ReactMarkdown
        children={markdownContent}
        components={{ ...autoHashLinkingTitleSet }}
      />
    </section>
  )
}
