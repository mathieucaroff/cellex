import { Color } from "../type"
import { hslToRGB } from "./hslToHex"

const baseLuminosity = 0.6
const lumSpacing = 0.2
const saturation = 0.7

const luminosityArray = [baseLuminosity + lumSpacing, baseLuminosity - lumSpacing]

export function randomPalette(colorCount: number): Color[] {
    const diversityRatio = 1 / 2
    let baseHue = Math.floor(360 * Math.random())

    // A hueBoost value above one increases the amplitude of the variation
    // around the baseHue. This helps diversify the color when the hue
    // is over-represented in the chromatic circle.
    let hueBoost = 1

    if (80 <= baseHue && baseHue < 140) {
        // green
        hueBoost = 2
        console.log("**green**")
    } else if (180 <= baseHue && baseHue < 260) {
        // blue
        hueBoost = 2
        console.log("**blue**")
    } else if (300 <= baseHue) {
        // red
        hueBoost = 1.8
        console.log("**red**")
    }

    return Array.from({ length: colorCount }, (_, k) => {
        let relativeK = k - Math.floor(colorCount / 2)
        let hue = (baseHue + (hueBoost * diversityRatio * 360 * relativeK) / colorCount) % 360
        return hslToRGB(hue, saturation, luminosityArray[k % 2])
    })
}
