import type { InjectionKey } from 'vue'

export type Instance = ReturnType<typeof makeInstance>

export interface Layer {
    id: string
    name: string
    type: 'paint'
    order: number
    data: OffscreenCanvas
    width: number
    height: number
}

interface LayerPointEvent {
    event: PointerEvent
    x: number
    y: number
    pressure: number
    ctx: OffscreenCanvasRenderingContext2D
}

export interface InstanceEvents {
    'layer:pointerdown': LayerPointEvent
    'layer:pointermove': LayerPointEvent
    'layer:pointerup': LayerPointEvent
}

export interface Artboard {
    id: string
    name: string
    width: number
    height: number
    x: number
    y: number
    activeLayerId: string
    visibleLayers: string[]
    layers: Layer[]
}

export interface Observer {
    name: string
    callback: (data: any) => void
}

const key = Symbol() as InjectionKey<Instance>

const files = import.meta.glob<{ default: BrushDefinition }>('@/brushes/*.ts', {
    eager: true,
})

const allBrushes = Object.values(files).map((f) => f.default)

export function makeInstance() {
    const container = ref()

    function setContainer(value: HTMLElement) {
        container.value = value
    }

    // events
    const observers = ref<Observer[]>([])

    function on<T extends keyof InstanceEvents>(
        name: T,
        callback: (data: InstanceEvents[T]) => void
    ) {
        observers.value.push({ name, callback })
    }

    function off(name: string, callback: (data: any) => void) {
        const index = observers.value.findIndex((o) => o.name === name && o.callback === callback)

        if (index !== -1) {
            observers.value.splice(index, 1)
        }
    }

    function emit<T extends keyof InstanceEvents>(name: T, data: InstanceEvents[T]) {
        observers.value.filter((o) => o.name === name).forEach((o) => o.callback(data))
    }

    // artboard
    const activeArtboardId = ref<string>()
    const artboards = ref<Artboard[]>([])
    const activeArtboard = computed(() =>
        artboards.value.find((a) => a.id === activeArtboardId.value)
    )

    function setActiveArtboard(id: string) {
        activeArtboardId.value = id
    }

    function addArtboard(artboard: Artboard) {
        artboards.value.push(artboard)

        if (artboards.value.length === 1) {
            setActiveArtboard(artboard.id)
        }
    }

    function setArtboardLayers(id: string, layers: Layer[]) {
        const artboard = artboards.value.find((a) => a.id === id)

        if (artboard) {
            artboard.layers = layers
        }
    }

    function setArtboardVisibleLayers(id: string, layerIds: string[]) {
        const artboard = artboards.value.find((a) => a.id === id)

        if (artboard) {
            artboard.visibleLayers = layerIds
        }
    }

    function setArtboardActiveLayer(id: string, layerId: string) {
        const artboard = artboards.value.find((a) => a.id === id)

        if (artboard) {
            artboard.activeLayerId = layerId
        }
    }

    // position & scale
    const position = ref({ x: 0, y: 0 })
    const scale = ref(1)

    function setPosition(value: { x: number; y: number }) {
        position.value = value
    }

    function setScale(value: number) {
        scale.value = value
    }

    // brush
    const brushes = ref<BrushDefinition[]>(allBrushes)
    const activeBrush = ref<BrushDefinition>(allBrushes[0]!)

    function setActiveBrush(id: string) {
        const brush = brushes.value.find((b) => b.id === id)

        if (brush) {
            activeBrush.value = brush
        }
    }

    function updateActiveBrush(payload: Partial<BrushDefinition>) {
        activeBrush.value = { ...activeBrush.value, ...payload }
    }

    return reactive({
        container: readonly(container),
        setContainer,

        artboards: readonly(artboards),
        activeArtboardId: readonly(activeArtboardId),
        activeArtboard: readonly(activeArtboard),
        setActiveArtboard,
        setArtboardLayers,
        setArtboardActiveLayer,
        addArtboard,
        setArtboardVisibleLayers,

        position: readonly(position),
        scale: readonly(scale),

        setPosition,
        setScale,

        brushes: readonly(brushes),
        activeBrush: readonly(activeBrush),

        setActiveBrush,
        updateActiveBrush,

        observers: readonly(observers),
        on,
        off,
        emit,
    })
}

export function useInstance(): Instance {
    const instance = inject(key, null)

    if (instance) {
        return instance
    }

    const newInstace = makeInstance()

    provide(key, newInstace)

    return newInstace
}
