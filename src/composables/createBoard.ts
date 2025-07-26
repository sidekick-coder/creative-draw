import type { Layer } from './useLayer'

export type Board = ReturnType<typeof createBoard>

export function createBoard() {
    const emitter = createEmitter()
    const context = createContext()

    // layers
    const layers = ref([] as Layer[])
    const activeLayerId = context.createRef<string | null>('activeLayerId', null)

    function addLayer(layerOrRef: MaybeRef<Layer>) {
        const layer = toValue(layerOrRef)

        console.debug('[board] add layer', layer)

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
        activeLayerId,

        addLayer,
    })
}
