interface Options {
    width: Ref<number>
    height: Ref<number>
    layers: Ref<ProjectDataLayer[]>
}

interface Checkpoint {
    id: string
    label?: string
    data: {
        width: number
        height: number
        layers: ProjectDataLayer[]
    }
}

export function createToolHistory({ width, height, layers }: Options) {
    const history = ref<Checkpoint[]>([])
    const activeIndex = ref(-1)

    const previousChanges = computed(() => {
        if (activeIndex.value === -1) return []

        return history.value.slice(0, activeIndex.value)
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
            data: {
                width: width.value,
                height: height.value,
                layers: [],
            },
        }

        for (const layer of layers.value) {
            const canvas = new OffscreenCanvas(width.value, height.value)

            const context = canvas.getContext('2d')!

            context.drawImage(layer.data, 0, 0)

            checkpoint.data.layers.push({
                ...layer,
                data: canvas,
            })
        }

        history.value = history.value.slice(0, activeIndex.value + 1)

        history.value.push(checkpoint)

        activeIndex.value = history.value.length - 1
    }

    function set(id: string) {
        const index = history.value.findIndex((c) => c.id === id)
        const item = history.value[index]

        if (index === -1 || !item) return

        activeIndex.value = index

        const { data } = item

        width.value = data.width
        height.value = data.height

        const newLayers: ProjectDataLayer[] = []

        for (const layer of data.layers) {
            const canvas = new OffscreenCanvas(width.value, height.value)

            const context = canvas.getContext('2d')!

            context.drawImage(layer.data, 0, 0)

            newLayers.push({
                ...layer,
                data: canvas,
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
