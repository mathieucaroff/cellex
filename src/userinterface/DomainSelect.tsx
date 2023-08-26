import { Select } from "antd"
import { DefaultOptionType } from "antd/lib/select"
import { useContext } from "react"

import { parseNomenclature } from "../nomenclature/nomenclature"
import { ReactContext } from "../state/ReactContext"

export let DomainSelect = () => {
  let { context } = useContext(ReactContext)

  return (
    <Select
      title="Select a domain"
      value=""
      style={{ width: "34px" }}
      dropdownStyle={{ minWidth: "340px", height: "" }}
      options={generateSupportedDomainArray()}
      listHeight={400}
      onChange={(value) => {
        context.updateState((state) => {
          state.automaton = parseNomenclature(value)
        })
      }}
    />
  )
}

function generateSupportedDomainArray() {
  const labelValue = (s: string) => ({ label: s, value: `${s}, rule 1` })

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
      subArray.push(labelValue(`neighborhood size ${ns}, ${c} colors`))
    })
    let suffix = ns > 3 ? ` of neighborhood size ${ns}` : ""
    domainArray.push({ label: `Domains${suffix}`, options: subArray })
  })

  return domainArray
}
