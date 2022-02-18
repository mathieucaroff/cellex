export function setQueryString(window: Window, key: string, value: string) {
    let param = new URLSearchParams(window.location.search)
    param.set(key, value)
    let url = new URL(window.location.href)
    url.search = param.toString()
    window.history.pushState({}, window.document.title, url)
}
