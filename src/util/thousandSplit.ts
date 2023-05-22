/** thousandSplit adds billion markers (__) and thousand markers (_) */
export let thousandSplit = (integer: string) => {
  let reverse = integer.split("").reverse().join("")
  reverse = reverse.replace(/([0-9]{9})/g, "$1_")
  reverse = reverse.replace(/([0-9]{3})/g, "$1_")
  reverse = reverse.replace(/_+$/, "")
  return reverse.split("").reverse().join("")
}

export let numberToStringWithThousandSplit = (integer: number) => {
  let text = String(integer)
  if (text.includes("Infinity")) {
    return text
  }
  if (text.includes("e")) {
    return text.replace(/(\...)(.*)e/, "$1e")
  }
  return thousandSplit(text)
}
