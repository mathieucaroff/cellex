import { DesktopOrMobile } from "../type"

/**
 * @param navigator the current navigator
 * @returns true when the userAgent data corresponds to that of a mobile
 */
export function getDesktopOrMobile(navigator: Navigator): DesktopOrMobile {
  let isMobile: boolean
  if (navigator.userAgentData) {
    isMobile = navigator.userAgentData.mobile
  } else {
    isMobile = !!navigator.userAgent.match(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i,
    )
  }
  return isMobile ? "mobile" : "desktop"
}
