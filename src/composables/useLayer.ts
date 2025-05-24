import { createLayer } from './createLayer'

export type Layer = ReturnType<typeof createLayer>

const key = Symbol('layer') as InjectionKey<Layer>

export function useLayer() {
    const board = inject(key, null)

    if (!board) {
        return createLayer()
    }

    return board
}
