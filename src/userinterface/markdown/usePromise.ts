import React from 'react'

export let usePromise = <T>(init: () => T, promise: Promise<T>) => {
   let [tree, setTree] = React.useState(init)

   React.useEffect(() => {
      promise.then(setTree)
   }, [])

   return tree
}
