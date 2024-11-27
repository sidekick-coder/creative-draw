export function onLoad<T>(el: Ref<T>, callback: (el: T) => void) {
    const unwatch = watch(el, (value) => {
        if (value) {
            callback(value)
            unwatch()
        }
    })
}
