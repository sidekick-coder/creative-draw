<script setup lang="ts">
const instance = useInstance()

const artboard = computed(() => instance.activeArtboard)

const activeId = computed({
    get: () => instance.activeArtboard?.activeLayerId,
    set: (value: string) => {
        instance.setArtboardActiveLayer(instance.activeArtboard!.id, value)
    },
})

const layers = computed({
    get: () => instance.activeArtboard?.layers || [],
    set: (value: Artboard['layers']) => {
        if (!instance.activeArtboard) {
            return
        }

        value.forEach((l, i) => {
            l.order = value.length - i
        })

        value.sort((a, b) => b.order - a.order)

        instance.setArtboardLayers(instance.activeArtboard.id, value)
    },
})

function onClick(id: string) {
    activeId.value = id
}

function onChangeName(id: string, event: Event) {
    const input = event.target as HTMLInputElement

    const newLayers = layers.value.slice().map((l) => ({ ...l }))

    const item = newLayers.find((l) => l.id === id)

    if (!item) {
        return
    }

    item.name = input.value

    layers.value = newLayers
}

function addNew() {
    if (!instance.activeArtboard) {
        return
    }

    const index = layers.value.length + 1
    const id = createId()

    const newLayers = layers.value.slice().map((l) => ({ ...l }))

    const width = instance.activeArtboard.width
    const height = instance.activeArtboard.height

    newLayers.unshift({
        id: id,
        type: 'paint',
        name: 'Layer ' + index,
        order: index,
        data: new OffscreenCanvas(width, height),
        width: width,
        height: height,
    })

    layers.value = newLayers

    toggleVisible(id)
}

function remove(id: string) {
    const newLayers = layers.value.slice().map((l) => ({ ...l }))

    const index = newLayers.findIndex((l) => l.id === id)

    if (index === -1) {
        return
    }

    newLayers.splice(index, 1)

    layers.value = newLayers
}

function onDrop({ item, dropTarget }: any) {
    if (!item || !dropTarget) {
        return
    }

    let newLayers = layers.value.slice().map((l) => ({ ...l }))

    const currentIndex = newLayers.findIndex((l) => l.id === item.id)
    const targetIndex = newLayers.findIndex((l) => l.id === dropTarget.id)

    if (currentIndex === -1 || targetIndex === -1) {
        return
    }

    const [removedItem] = newLayers.splice(currentIndex, 1)

    newLayers.splice(targetIndex, 0, removedItem!)

    layers.value = newLayers
}

function toggleVisible(id: string) {
    if (!instance.activeArtboard) {
        return
    }

    const visible = instance.activeArtboard.visibleLayers.slice()

    if (visible.includes(id)) {
        visible.splice(visible.indexOf(id), 1)
    } else {
        visible.push(id)
    }

    instance.setArtboardVisibleLayers(instance.activeArtboard!.id, visible)
}
</script>
<template>
    <cd-card v-if="artboard" class="w-96 bg-body-900">
        <cd-card-head>
            <cd-card-title class="mr-auto text-base">Layers</cd-card-title>

            <cd-btn variant="text" padding="none" size="sm" @click="addNew">
                <cd-icon name="heroicons:plus-20-solid" />
            </cd-btn>
        </cd-card-head>

        <cd-drag-zone @drop="onDrop">
            <cd-drag-item v-for="l in layers" :key="l.id" :model-value="l">
                <cd-list-item
                    class="group flex"
                    color="none"
                    :active="l.id === activeId"
                    @click="onClick(l.id)"
                >
                    <cd-ui-layer-preview :model-value="l" />

                    <div class="flex-1">
                        <input
                            :value="l.name"
                            class="h-10 w-full bg-transparent px-4 text-sm text-body-0 hover:bg-body-800 focus:bg-body-600 focus:outline-none"
                            @change="onChangeName(l.id, $event)"
                            @click.stop
                        />
                    </div>

                    <div class="flex">
                        <cd-btn
                            variant="text"
                            padding="none"
                            size="sm"
                            color="none"
                            class="text-body-100 hover:text-body-50"
                            @click="remove(l.id)"
                        >
                            <cd-icon name="heroicons:trash-20-solid" />
                        </cd-btn>

                        <cd-btn
                            variant="text"
                            padding="none"
                            color="none"
                            class="text-body-100 hover:text-body-50"
                            size="sm"
                            @click.stop="toggleVisible(l.id)"
                        >
                            <cd-icon
                                v-if="artboard.visibleLayers.includes(l.id)"
                                name="heroicons:eye-20-solid"
                            />
                            <cd-icon v-else name="heroicons:eye-slash-20-solid" />
                        </cd-btn>
                    </div>
                </cd-list-item>
            </cd-drag-item>
        </cd-drag-zone>
    </cd-card>
</template>
