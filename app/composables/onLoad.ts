export function onLoad<T>(el: Ref<T>, callback: (el: NonNullable<T>) => void) {
    const unwatch = watch(el, (value) => {
        if (value) {
            callback(value)
            unwatch()
        }
    })
}
