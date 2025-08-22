import { createHead } from '@unhead/vue/client'

export default definePlugin(({ app }) => {
    const head = createHead()

    app.use(head)
})
