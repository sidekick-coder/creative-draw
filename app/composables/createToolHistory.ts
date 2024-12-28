interface Options {
    width: Ref<number>
    height: Ref<number>
    layers: Ref<ProjectDataLayer[]>
}

interface CheckpointLayer extends Omit<ProjectDataLayer, 'canvas'> {
    data: ImageData
}

interface Checkpoint {
    id: string
    label?: string
    layers: CheckpointLayer[]
}

export function createToolHistory({ width, height, layers }: Options) {
    const history = ref<Checkpoint[]>([])
    const activeIndex = ref(-1)
    const maxHistory = 50

    const previousChanges = computed(() => {
        if (activeIndex.value === -1) return []

        return history.value.slice(0, activeIndex.value + 1)
    })

    const nextChanges = computed(() => {
        if (activeIndex.value === -1) return []

        return history.value.slice(activeIndex.value + 1)
    })

    function add(label = 'checkpoint') {
        const id = createId()

        const checkpoint: Checkpoint = {
            id,
            label,
            layers: [],
        }

        for (const layer of layers.value) {
            const canvas = document.createElement('canvas')

            canvas.width = width.value
            canvas.height = height.value

            const context = canvas.getContext('2d')!

            context.drawImage(layer.canvas, 0, 0)

            const data = context.getImageData(0, 0, width.value, height.value)

            checkpoint.layers.push({
                ...layer,
                data,
                canvas: undefined,
            } as CheckpointLayer)
        }

        const newHistory = history.value.slice(0, activeIndex.value + 1)

        if (newHistory.length >= maxHistory) {
            newHistory.shift()
        }

        newHistory.push(checkpoint)

        history.value = newHistory

        activeIndex.value = newHistory.length - 1
    }

    function set(id: string) {
        const index = history.value.findIndex((c) => c.id === id)
        const item = history.value[index]

        if (index === -1 || !item) return

        activeIndex.value = index

        const newLayers: ProjectDataLayer[] = []

        for (const layer of item.layers) {
            const canvas = document.createElement('canvas')

            canvas.width = layer.width
            canvas.height = layer.height

            const context = canvas.getContext('2d')!

            context.putImageData(layer.data, 0, 0)

            newLayers.push({
                ...layer,
                canvas,
            })
        }

        layers.value = newLayers
    }

    function undo() {
        const item = history.value[activeIndex.value - 1]

        if (!item) return

        set(item.id)
    }

    function redo() {
        const item = history.value[activeIndex.value + 1]

        if (!item) return

        set(item.id)
    }

    return reactive({
        history: readonly(history),
        previousChanges,
        nextChanges,
        activeIndex: readonly(activeIndex),

        add,
        set,
        undo,
        redo,
    })
}
