let synchronize = (asyncList: (() => Promise<void>)[]) => (): Promise<void> => {
    return asyncList.reduce((acc, f) => acc.finally(f), Promise.resolve())
}

let main = async () => {
    let filenameList = ["./testPatternLang", "./testSideBorderLang", "./testTopBorderLang"]
    let importList = filenameList.map((filename) => () => {
        console.log(`\n# import("${filename}")\n`)
        return import(filename)
    })
    let chain = synchronize(importList)
    chain()
}

main()
