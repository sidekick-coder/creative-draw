export function createContext(initialContext: Record<string, any> = {}) {
    const context = ref(new Map<string, any>(Object.entries(initialContext)))

    function get<T = any>(key: string, defaultValue?: T): T {
        if (!context.value.has(key) && defaultValue !== undefined) {
            return defaultValue as T
        }

        const value = context.value.get(key)

        if (!context.value.has(key)) {
            throw new Error(`Context ${key} is not set`)
        }

        return value as T
    }

    function set<T = any>(key: string, value: T) {
        context.value.set(key, value)
    }

    function all(): Record<string, any> {
        const data: Record<string, any> = {}

        for (const [key, value] of context.value.entries()) {
            data[key] = value
        }

        return data
    }

    function createRef<T>(name: string, defaultValue?: T): Ref<T> {
        return computed({
            get: () => get(name, defaultValue),
            set: (value: T) => {
                context.value.set(name, value)
            },
        })
    }

    return {
        get,
        set,
        all,
        createRef,
    }
}
