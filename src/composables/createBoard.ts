import type { Layer } from './useLayer'

export type Board = ReturnType<typeof createBoard>

export function createBoard() {
    const emitter = createEmitter()
    const context = createContext()

    // layers
    const layers = ref([] as Layer[])

    function addLayer(layer: Layer) {
        layers.value.push(layer)

        emitter.emit('layer:add', layer)

        layer.emitter.on('set', ({ key, value }: { key: string; value: any }) => {
            emitter.emit(`layer:set:${key}`, { key, value, layer })
        })
    }

    return reactive({
        emitter,
        context,

        layers,

        addLayer,
    })
}
