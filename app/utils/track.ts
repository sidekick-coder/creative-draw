interface Event {
    name: string
    data: any
}

interface Listener {
    name: string
    handle: (event: Event) => any
}

const listeners: Listener[] = []

export function addTrackListener(listener: Listener) {
    const runtimeConfig = useRuntimeConfig()

    listeners.push(listener)

    if (runtimeConfig.public.trackingDebug) {
        console.debug('[track] listener added', listener.name)
    }
}

export function $track(event: string, data?: any) {
    const runtimeConfig = useRuntimeConfig()

    if (!runtimeConfig.public.trackingEnabled) return

    for (const listener of listeners) {
        listener.handle({
            name: event,
            data,
        })

        if (runtimeConfig.public.trackingDebug) {
            console.debug('[track]', event, data)
        }
    }
}
