import { createRouter, createWebHistory } from 'vue-router'
import { routes } from 'vue-router/auto-routes'

routes.push({
    path: '/threads/:id',
    redirect: (to) => {
        const id = (to.params as any).id

        return `/threads/${id}/items`
    },
})

routes.push({
    path: '/',
    redirect: '/workspaces',
})

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default definePlugin(({ app }) => {
    app.use(router)
})
