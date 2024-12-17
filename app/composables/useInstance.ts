import type { InjectionKey } from 'vue'

export type Instance = ReturnType<typeof makeInstance>

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

export interface Observer {
    name: string
    callback: (data: any) => void
}

const key = Symbol() as InjectionKey<Instance>

export function makeInstance() {
    const container = ref()
    const containerWidth = ref(0)
    const containerHeight = ref(0)
    const width = ref(0)
    const height = ref(0)

    function load(el: HTMLElement, w: number, h: number) {
        container.value = el

        containerWidth.value = el.clientWidth
        containerHeight.value = el.clientHeight

        width.value = w
        height.value = h
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

    // layers
    const activeLayerId = ref<string>()
    const layers = ref<Layer[]>([])
    const activeLayer = computed(() => layers.value.find((l) => l.id === activeLayerId.value))
    const visibleLayers = ref<string[]>([])

    function setActiveLayer(id: string) {
        activeLayerId.value = id
    }

    function setLayers(l: Layer[]) {
        layers.value = l
    }

    function setVisibleLayers(layerIds: string[]) {
        visibleLayers.value = layerIds
    }

    // tools
    const activeTool = ref<string>('brush')

    const tools = {
        brush: createToolBrush(),
        eraser: createToolEraser(),
        color: createToolColor(),
        zoomAndPan: createToolZoomAndPan({
            width,
            height,
            containerWidth,
            containerHeight,
        }),
        history: createToolHistory({
            width,
            height,
            layers,
            activeLayerId,
        }),
    }

    function setTool(id: string) {
        activeTool.value = id
    }

    return reactive({
        container: readonly(container),
        containerWidth: readonly(containerWidth),
        containerHeight: readonly(containerHeight),
        width: readonly(width),
        height: readonly(height),
        load,

        layers: readonly(layers),
        activeLayer: readonly(activeLayer),
        activeLayerId: readonly(activeLayerId),
        visibleLayers: readonly(visibleLayers),
        setLayers,
        setActiveLayer,
        setVisibleLayers,

        activeTool: readonly(activeTool),
        tools,
        setTool,

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
