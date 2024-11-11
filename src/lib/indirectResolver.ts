export type InfoObject<T> = {
  [K in keyof T]: [(param: Indirect<T>) => any, ...([] | [undefined] | [(value: any) => T[K]])]
}

export type Indirect<T> = {
  [K in keyof T]: () => T[K]
}

export function indirectResolve<T>(info: InfoObject<T>): T {
  let result: T = {} as any

  let resolver: Indirect<T> = {} as any

  Object.keys(info).forEach((key) => {
    resolver[key] = () => {
      let [obtain, postprocess = (x) => x] = info[key]
      let value = postprocess(obtain(resolver))
      resolver[key] = () => value
      return value
    }
  })

  Object.keys(info).forEach((key) => {
    result[key] = resolver[key]()
  })

  return result
}
