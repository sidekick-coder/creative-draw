interface Options {
    class: Ref<any>
}

export function useClassBuilder(options: Options | MaybeRef<string | string[]>) {
    const map = ref(new Map<string, string>())
    const className =
        'class' in (options as Options)
            ? toRef((options as Options).class || '')
            : toRef(options || undefined)

    const classes = computed(() => {
        const all = Array.from(map.value.values()).join(' ')

        return twMerge(all, className.value)
    })

    function set(key: string, values: string | string[]) {
        map.value.set(key, Array.isArray(values) ? values.join(' ') : values)
    }

    return { map, classes, set }
}
