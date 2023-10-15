import { DefaultOptionType } from "antd/es/select"

import { Domain } from "../automatonType"
import { presentAutomaton } from "../nomenclature/nomenclature"
import { randomRuleFromDomain } from "./curatedAutomata"

/** isValidDomain checks that the domain is in bound **for rule-based automata**
 * (for code automata, it restricts the neighborhood size more than necessary)
 */
export function isValidDomain(domain: Domain) {
  let { stateCount: c, neighborhoodSize: ns, reversible } = domain
  return (
    c >= 2 &&
    c <= 7 && // c in bound
    ns >= 3 &&
    c ** ns <= 4096 && // rule not too big, ns in bound
    ns % 2 === 1 && // ns is odd
    (!reversible || isPowerOfTwo(c))
  )
}

export function isPowerOfTwo(a: number) {
  return 2 ** Math.floor(Math.log2(a)) === a
}

export function generateSupportedDomainArray() {
  const labelValue = (s: string, d: Domain) => ({
    label: s,
    value: presentAutomaton(randomRuleFromDomain(d)).descriptor,
  })

  const domainArray: DefaultOptionType[] = []

  // iterate on the neighborhood sizes
  Array.from({ length: 12 }, (_, ns) => {
    /* prettier-ignore */
    if (
      false
      || ns < 2 || ns > 11 // ns out of bound
      || ns % 2 === 0 // ns must be odd
    ) {
      return
    }

    const subArray: DefaultOptionType[] = []
    Array.from({ length: 8 }, (_, c) => {
      /* prettier-ignore */
      if (
        false
        || c < 2 || c > 7 // c out of bound
        || c ** ns > 4096 // rule too big
      ) {
        return
      }

      let isReversible = isPowerOfTwo(c)

      Array.from({ length: isReversible ? 2 : 1 }, (_, r) => {
        subArray.push(
          labelValue(`neighborhood size ${ns}, ${c} colors${r ? " [reversible]" : ""}`, {
            dimension: 1,
            neighborhoodSize: ns,
            stateCount: c,
            reversible: !!r,
          }),
        )
      })
    })
    let suffix = ns > 3 ? ` of neighborhood size ${ns}` : ""
    domainArray.push({ label: `Domains${suffix}`, options: subArray })
  })

  return domainArray
}
