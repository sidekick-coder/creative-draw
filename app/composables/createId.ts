function fallback() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16));
}
export function createId() {
    if (import.meta.server) {
        return require('crypto').randomUUID()
    }

    if (typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID()
    }

    return fallback()
}
