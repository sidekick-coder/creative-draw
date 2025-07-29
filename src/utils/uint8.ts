export const $uint8 = {
    toBase64: (uint8Array: Uint8Array): string => {
        return btoa(String.fromCharCode(...uint8Array))
    },
    fromBase64: (base64String: string): Uint8Array => {
        const binaryString = atob(base64String)
        const length = binaryString.length
        const uint8Array = new Uint8Array(length)

        for (let i = 0; i < length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i)
        }

        return uint8Array
    },
    toBlob: (uint8Array: Uint8Array, mimeType: string): Blob => {
        return new Blob([uint8Array], { type: mimeType })
    },
}
