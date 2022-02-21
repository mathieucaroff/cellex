export let limitLength = (text: string, limit: number) => {
    if (text.length > limit) {
        text = text.slice(0, limit)
        if (limit >= 4) {
            text = text.slice(0, limit - 3) + "..."
        }
    }
    return text
}
