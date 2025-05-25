import type { Layer } from './useLayer'

export type Board = ReturnType<typeof createBoard>

export function createBoard() {
    const container = ref()
    const emitter = createEmitter()

    // layers
    const layers = ref([] as Layer[])

    function addLayer(layer: Layer) {
        layers.value.push(layer)

        emitter.emit('layer:add', layer)

        layer.emitter.on('set', ({ key, value }) => {
            emitter.emit(`layer:set:${key}`, { key, value, layer })
        })
    }

    return reactive({
        container,
        emitter,

        layers,

        addLayer,
    })
}
