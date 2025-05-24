interface LayerPointEvent {
    event: PointerEvent
    x: number
    y: number
    pressure: number
    ctx: OffscreenCanvasRenderingContext2D
}

interface LayerTouchEvent {
    event: TouchEvent
    x: number
    y: number
    pressure: number
    ctx: OffscreenCanvasRenderingContext2D
}

interface LayerMouseEvent {
    event: MouseEvent
    x: number
    y: number
    ctx: OffscreenCanvasRenderingContext2D
}

interface ContainerPointEvent {
    event: PointerEvent
}

interface ContainerTouchEvent {
    event: TouchEvent
}

interface ContainerMouseEvent {
    event: MouseEvent
}

export interface InstanceEvents {
    'layer:pointerdown': LayerPointEvent
    'layer:pointermove': LayerPointEvent
    'layer:pointerup': LayerPointEvent
    'layer:touchstart': LayerTouchEvent
    'layer:touchmove': LayerTouchEvent
    'layer:touchend': LayerTouchEvent
    'layer:mousedown': LayerMouseEvent
    'layer:mousemove': LayerMouseEvent
    'layer:mouseup': LayerMouseEvent

    'container:pointerdown': ContainerPointEvent
    'container:pointermove': ContainerPointEvent
    'container:pointerup': ContainerPointEvent
    'container:touchstart': ContainerTouchEvent
    'container:touchmove': ContainerTouchEvent
    'container:touchend': ContainerTouchEvent
    'container:mousedown': ContainerMouseEvent
    'container:mousemove': ContainerMouseEvent
    'container:mouseup': ContainerMouseEvent

    [key: string]: any
}

export type Board = ReturnType<typeof createBoard>

export function createBoard() {
    const container = ref()
    const containerWidth = ref(0)
    const containerHeight = ref(0)
    const width = ref(0)
    const height = ref(0)

    const emmiter = createEmitter()

    function load(el: HTMLElement, w: number, h: number) {
        container.value = el

        containerWidth.value = el.clientWidth
        containerHeight.value = el.clientHeight

        width.value = w
        height.value = h
    }

    // layers
    const activeLayerId = ref<string>()
    const layers = ref<Layer[]>([])
    const activeLayer = computed(() => layers.value.find((l) => l.id === activeLayerId.value))
    const visibleLayers = ref<string[]>([])

    function setActiveLayer(id: string) {
        activeLayerId.value = id
    }

    function setLayers(l: ProjectDataLayer[]) {
        layers.value = l
    }

    function setVisibleLayers(layerIds: string[]) {
        visibleLayers.value = layerIds
    }

    // tools
    const activeTool = ref<string>('brush')

    const tools = {
        // brush: createToolBrush(),
        // eraser: createToolEraser(),
        // color: createToolColor(),
        // zoomAndPan: createToolZoomAndPan({
        //     width,
        //     height,
        //     containerWidth,
        //     containerHeight,
        // }),
        // history: createToolHistory({
        //     width,
        //     height,
        //     layers,
        //     activeLayerId,
        // }),
    }

    function setTool(id: string) {
        activeTool.value = id
    }

    return reactive({
        container: readonly(container),
        emitter: readonly(emmiter),

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
    })
}
