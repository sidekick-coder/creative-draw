import type { InjectionKey } from 'vue'

export type Instance = ReturnType<typeof makeInstance>

export interface Layer {
    id: string
    name: string
    type: 'path'
    order: number
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

const key = Symbol() as InjectionKey<Instance>

export function makeInstance() {
    const container = ref()
    const artboards = ref<Artboard[]>([])
    const position = ref({ x: 0, y: 0 })
    const scale = ref(1)

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

    return reactive({
        container: readonly(container),
        artboards: readonly(artboards),
        position: readonly(position),
        scale: readonly(scale),

        setContainer,
        setPosition,
        setScale,
        addArtboard,
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
