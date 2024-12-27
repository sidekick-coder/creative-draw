import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
    const router = useRouter()

    router.afterEach((to) => {
        nextTick(() => {
            $track('$pageview', {
                current_url: to.fullPath,
            })
        })
    })
})
