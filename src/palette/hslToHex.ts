import { Color } from "../type"

/**
 * hslToRGB
 * @param hue hue (0-360)
 * @param sat saturation (0-1)
 * @param lum luminosity (0-1)
 * @returns a color object with colors red, green and blue
 */
export let hslToRGB = (hue, sat, lum): Color => {
  // https://stackoverflow.com/a/44134328/9878263
  let a = sat * Math.min(lum, 1 - lum)
  let f = (n) => {
    let k = (n + hue / 30) % 12
    let color = lum - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
  }
  return {
    red: f(0),
    green: f(8),
    blue: f(4),
  }
}

/**
 * hslToHex
 * @param hue hue (0-360)
 * @param sat saturation (0-1)
 * @param lum luminosity (0-1)
 * @returns an hexadecimal CSS color
 */
export let hslToHex = (hue, sat, lum) => {
  let rgb = hslToRGB(hue, sat, lum)
  let hex = (x: number) => {
    // convert to Hexadecimal and prefix "0" if needed
    return x.toString(16).padStart(2, "0")
  }
  return `#${hex(rgb.red)}${hex(rgb.green)}${hex(rgb.blue)}`
}
