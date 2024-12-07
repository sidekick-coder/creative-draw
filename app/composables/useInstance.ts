import type { InjectionKey } from 'vue'

export type Instance = ReturnType<typeof makeInstance>

export interface Layer {
    id: string
    name: string
    type: 'path'
    order: number
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
    layers: Layer[]
}

export interface Observer {
    name: string
    callback: (data: any) => void
}

const key = Symbol() as InjectionKey<Instance>

export function makeInstance() {
    const container = ref()
    const artboards = ref<Artboard[]>([])
    const position = ref({ x: 0, y: 0 })
    const scale = ref(1)
    const observers = ref<Observer[]>([])

    function setContainer(value: HTMLElement) {
        container.value = value
    }

    function addArtboard(artboard: Artboard) {
        artboards.value.push(artboard)
    }

    function setPosition(value: { x: number; y: number }) {
        position.value = value
    }

    function setScale(value: number) {
        scale.value = value
    }

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

    return reactive({
        container: readonly(container),
        artboards: readonly(artboards),
        position: readonly(position),
        scale: readonly(scale),

        setContainer,
        setPosition,
        setScale,
        addArtboard,
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
