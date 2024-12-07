export function createId() {
    if (import.meta.server) {
        return require('crypto').randomUUID()
    }

    return window.crypto.randomUUID()
}
