export function copy<T>(payload: T): T {
    return JSON.parse(JSON.stringify(payload))
}
