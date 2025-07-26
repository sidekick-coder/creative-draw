interface Options {
    state?: MaybeRef<Map<string, any>>
    debug?: boolean
}

export type TransformPlugin = ReturnType<typeof createTransform>

export function createTransform(options: Options = {}) {
    let container: HTMLElement

    const state = toRef(options.state ?? new Map<string, any>())

    function apply() {
        if (!container) {
            return
        }

        const transform = Array.from(state.value.entries())
            .map(([key, value]) => `${key}(${value})`)
            .join(' ')

        container.style.transform = transform
    }

    function set(name: string, value: any) {
        state.value.set(name, value)

        nextTick(apply)

        if (options.debug) console.debug(`[transform] set ${name} to`, value)
    }

    return defineBoardPlugin(
        reactive({
            state,
            set,
            install(board) {
                container = board.context.get('container')
            },
        })
    )
}
