export function onLoad<T>(el: Ref<T>, callback: (el: NonNullable<T>) => void) {
    const unwatch = watch(el, (value) => {
        if (value) {
            callback(value)
            unwatch()
        }
    })
}

export function onLoadAll<T = any>(els: Ref<T[]>, callback: (els: NonNullable<T>[]) => void) {
    const unwatch = watch(els, (value) => {
        const allLoaded = value.every((el) => el)

        if (allLoaded) {
            callback(value as NonNullable<T>[])
            unwatch()
        }
    })
}
