interface TimeObject {
  totalTime: number
  count: number
  name?: string
}

const w = ((window as any).w = window as any)
const timedDataStore: Record<string, TimeObject> = (w.timeStore = {})

/**
 *
 * @param title The title of that function timing entry
 * @param f The function being timed
 * @returns
 */
export let timed = <K extends any>(title, f: () => K): K => {
  let stat = (timedDataStore[title] ??= {
    totalTime: 0,
    count: 0,
  })

  let close = () => {
    let end = Date.now()
    stat.totalTime += end - beginning
    stat.count += 1
  }

  let beginning = Date.now()
  let result = f()
  if (result && (result as any).finally) {
    return (result as any).finally(close)
  } else {
    close()
    return result
  }
}

const timerDataStore: Record<string, TimeObject[]> = (w.timerDataStore = {})

function createTimer(title: string, sectionName?: string) {
  const statArray = (timerDataStore[title] = [] as TimeObject[])
  let index = 0
  let beginning = Date.now()
  let lastSectionName = sectionName

  const section = (sectionName?: string) => {
    let end = Date.now()
    statArray[index] = {
      totalTime: end - beginning,
      count: 1,
      name: lastSectionName,
    }

    beginning = end
    lastSectionName = sectionName
    index += 1
  }

  const close = () => {
    statArray[index] = {
      totalTime: Date.now() - beginning,
      count: 1,
      name: lastSectionName,
    }
  }

  return { section, close }
}
/**
 * getTimer
 *
 * ```ts
 * let t = getTimer("timerName", "section0")
 * <code of section 0>
 * t.section("section1")
 * <code of section 1>
 * t.close()
 * ```
 *
 * @param title The process-wide-unique title of that timer
 * @param sectionName If provided, the name of that section
 * @returns A timer object supporting the .section(name) and .close() methods
 */
export function getTimer(title: string, sectionName?: string) {
  if (!timerDataStore[title]) {
    return createTimer(title, sectionName)
  }
  let statArray = timerDataStore[title]

  let index = 0
  let beginning = Date.now()

  const section = (sectionName?: string) => {
    let end = Date.now()
    statArray[index].totalTime += end - beginning
    statArray[index].count += 1

    beginning = end
    index += 1
  }

  const close = () => {
    statArray[index].totalTime += Date.now() - beginning
    statArray[index].count += 1
  }

  return { section, close }
}

w.report = function report() {
  Object.entries(timedDataStore).forEach(([title, { totalTime, count }]) => {
    let fps = (count * 1000) / totalTime
    console.log(title, totalTime / count, "ms", fps, "fps")
  })
  Object.entries(timerDataStore).forEach(([title, sectionArray]) => {
    console.log(title)
    sectionArray.forEach(({ name, totalTime, count }, k) => {
      let fps = (count * 1000) / totalTime
      console.log(`  ${k}. ${name ?? ""}`, totalTime / count, "ms", fps, "fps")
    })
  })
}
