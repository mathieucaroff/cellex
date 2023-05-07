import { DesktopOrMobile } from "../type"

/**
 *
 * @param userAgent the user agent of the navigator
 * @returns true when the userAgent corresponds to that of a mobile
 */
export function getDesktopOrMobile(userAgent: string): DesktopOrMobile {
  return userAgent.match(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i)
    ? "mobile"
    : "desktop"
}
