export interface Pair {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Rect extends Pair, Size {}

export interface Color {
  red: number
  green: number
  blue: number
}
export interface Remover {
  remove: () => void
}

export type DesktopOrMobile = "desktop" | "mobile"
