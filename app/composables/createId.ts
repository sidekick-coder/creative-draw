export function createId() {
    if (import.meta.server) {
        return require('crypto').randomUUID()
    }

    if (window.crypto.randomUUID) {
        return window.crypto.randomUUID()
    }

     return useId()
}
