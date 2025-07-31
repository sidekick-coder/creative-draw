import eruda from 'eruda'

export default definePlugin(({ app }) => {
    if (import.meta.env.PROD) {
        return
    }

    eruda.init()
})
