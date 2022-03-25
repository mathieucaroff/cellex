import { SideBorder } from "../patternlang/BorderType"
import { BorderRootGroup } from "../patternlang/BorderType"
import { TopologyFinite } from "../topologyType"
import { mod } from "../util/mod"

/**
 * getFutureTopology is used to create a topology which starts in the future of another topology
 *
 * @param topology the base topology
 * @param t the time at which the sample topology will be created. This is useful for borders
 * @param line the extracted line to use for all of the top border of the future topology
 * @returns a topology that can be fed to an engine
 */
export function getFutureTopology(topology: TopologyFinite, t: number, line: Uint8Array) {
    let topologyCycle = {
        type: "group" as const,
        quantity: 1 as const,
        width: 1,
        content: [
            {
                type: "state" as const,
                cumulativeMap: [1],
                quantity: 1,
                width: 1,
                total: 1,
            },
        ],
    }
    let futureTopology: TopologyFinite = {
        ...topology,
        genesis: {
            cycleLeft: topologyCycle,
            cycleRight: topologyCycle,
            center: lineToTopBorder(line),
        },
    }

    if (futureTopology.kind === "border") {
        futureTopology = {
            ...futureTopology,
            borderLeft: truncateBorder(futureTopology.borderLeft, t),
            borderRight: truncateBorder(futureTopology.borderRight, t),
        }
    }
    return futureTopology
}

export function lineToTopBorder(line: Uint8Array): BorderRootGroup {
    let content = Array.from(line, (x) => ({
        type: "state" as const,
        quantity: 1,
        width: 1,
        cumulativeMap: Array.from({ length: x }, () => 0).concat([1]),
        total: 1,
    }))
    return {
        type: "group",
        width: line.length,
        quantity: 1,
        content,
    }
}

/**
 * Create a truncated version of the given border.
 * @param border The border whose truncation is needed
 * @param t The place where it should be truncated
 * @returns The expected border
 */
export function truncateBorder(border: SideBorder, t: number): SideBorder {
    let initW = border.init.width
    let cycleW = border.cycle.width

    // truncate the init
    let content = border.init.content.slice(initW - t)
    if (t > initW) {
        // the original init is fully truncated. A part of the cycle must be
        // copy-rotated to the init to ensure proper alignment
        content = border.cycle.content.slice(-mod(t - initW, cycleW))
    }
    return {
        init: {
            type: "group",
            width: content.reduce((t, x) => t + x.width, 0),
            quantity: 1,
            content,
        },
        cycle: border.cycle,
    }
}
