import { Space, Tooltip } from "antd"
import { FaDiscord, FaGithub } from "react-icons/fa"

import * as packageInfo from "../../../package.json"
import "./social.css"

declare const __DISCORD_INVITE_URL__: string
declare const __COMMIT_HASH__: string
const version = `${packageInfo.version}-${__COMMIT_HASH__}`

export function Social() {
  return (
    <Space className="social">
      {__DISCORD_INVITE_URL__ && (
        <Tooltip title="Join the Cellex Discord server">
          <a href={__DISCORD_INVITE_URL__}>
            <FaDiscord size={40} />
          </a>
        </Tooltip>
      )}
      <Tooltip title={`Get the source code on GitHub (v${version})`}>
        <a href={packageInfo.repository}>
          <FaGithub size={40} />
        </a>
      </Tooltip>
    </Space>
  )
}
