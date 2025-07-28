export const $uint8 = {
    toBase64: (uint8Array: Uint8Array): string => {
        return btoa(String.fromCharCode(...uint8Array))
    },
}
