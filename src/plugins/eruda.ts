import eruda from 'eruda'

export default definePlugin(() => {
    if (import.meta.env.PROD || !import.meta.env.VITE_ERUDA) {
        return
    }

    eruda.init()
})
