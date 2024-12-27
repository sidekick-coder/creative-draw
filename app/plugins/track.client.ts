import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
    const router = useRouter()

    router.afterEach((to, from) => {
        nextTick(() => {
            if (from.fullPath !== to.fullPath) {
                $track('$pageleave', {
                    current_url: from.fullPath,
                })
            }

            $track('$pageview', {
                current_url: to.fullPath,
            })
        })
    })
})
