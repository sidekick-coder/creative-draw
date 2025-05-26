import { createLayer } from './createLayer'

export type Layer = ReturnType<typeof createLayer>

const key = Symbol('layer') as InjectionKey<Layer>

export function useLayer() {
    let layer = inject(key, null)

    if (!layer) {
        layer = createLayer()

        provide(key, layer)

        return layer
    }

    return layer
}
