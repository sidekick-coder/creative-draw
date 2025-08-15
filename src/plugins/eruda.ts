import eruda from 'eruda'

export default definePlugin(() => {
    if (import.meta.env.PROD || !import.meta.env.ERUDA) {
        return
    }

    eruda.init()
})
