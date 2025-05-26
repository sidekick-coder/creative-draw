export function createContext() {
    const context = new Map<string, any>()

    function get<T = any>(key: string, defaultValue?: T): T {
        const value = context.get(key) || defaultValue

        if (!value && defaultValue) {
            return defaultValue as T
        }

        if (!value) {
            throw new Error(`Context ${key} is not set`)
        }

        return value as T
    }

    function set<T = any>(key: string, value: T) {
        context.set(key, value)
    }

    return {
        get,
        set,
    }
}
