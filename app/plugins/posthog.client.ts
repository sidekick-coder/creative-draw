import { defineNuxtPlugin } from '#app'
import posthog from 'posthog-js'

export default defineNuxtPlugin(() => {
    const runtimeConfig = useRuntimeConfig()

    const { posthogPublicKey, posthogHost, posthogDebug } = runtimeConfig.public

    posthog.init(posthogPublicKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
        capture_pageview: false, // we add manual pageview capturing below
        loaded: (posthog) => {
            posthog.debug(posthogDebug)

            addTrackListener({
                name: 'posthog',
                handle: (event) => {
                    posthog.capture(event.name, event.data)
                },
            })
        },
    })
})
