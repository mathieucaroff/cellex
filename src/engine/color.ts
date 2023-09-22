import { Color } from "../type"

export function colorToHexColor(c: Color): string {
  return (
    "#" + [c.red, c.green, c.blue].map((x) => ("0" + Math.floor(x).toString(16)).slice(-2)).join("")
  )
}

export function hexColorToColor(c: string): Color {
  return {
    red: Number.parseInt(c.slice(1, 3), 16),
    green: Number.parseInt(c.slice(3, 5), 16),
    blue: Number.parseInt(c.slice(5, 7), 16),
  }
}
