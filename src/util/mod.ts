export let mod = (a: number, b: number) => ((a % b) + b) % b

export let modGet = <T>(data: T[], index: number): T => {
   return data[mod(index, data.length)]
}
