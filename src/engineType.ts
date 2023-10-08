export interface Stepper {
  step: (input: Uint8Array, olderInput: Uint8Array, output: Uint8Array, currentT: number) => void
}
