import type { Layer } from './useLayer'

export type Board = ReturnType<typeof createBoard>

export interface BoardLayerSetEvent<T = any> {
    key: string
    value: T
    layer: Layer
}

export interface CreateBoardOptions {
    width?: MaybeRef<number>
    height?: MaybeRef<number>
}

export function createBoard(options: CreateBoardOptions = {}) {
    const emitter = createEmitter()
    const context = createContext()
    const width = toRef(options.width ?? 800)
    const height = toRef(options.height ?? 600)

    // layers
    const layers = ref([] as Layer[])
    const activeLayerId = context.createRef<string | null>('activeLayerId', null)

    function addLayer(layerOrRef: MaybeRef<Layer>) {
        const layer = toValue(layerOrRef)

        console.debug('[board] add layer', layer.id)

        layers.value.push(layer)

        emitter.emit('layer:added', layer)

        layer.emitter.on('set', ({ key, value }: { key: string; value: any }) => {
            emitter.emit(`layer:set:${key}`, { key, value, layer })
        })
    }

    emitter.on('redraw', () => {
        layers.value.forEach((layer) => layer.emitter.emit('redraw'))
    })

    return reactive({
        width,
        height,

        emitter,
        context,

        layers,
        activeLayerId,

        addLayer,
    })
}
