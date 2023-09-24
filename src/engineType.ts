export interface Conceiver {
  conceive: (
    input: Uint8Array,
    olderInput: Uint8Array,
    output: Uint8Array,
    currentT: number,
  ) => void
}
