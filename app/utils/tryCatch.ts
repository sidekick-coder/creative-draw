export async function tryCatch<T>(cb: () => Promise<T>): Promise<[T, null] | [null, Error]> {
    try {
        return [await cb(), null]
    } catch (e) {
        return [null, e as any]
    }
}
