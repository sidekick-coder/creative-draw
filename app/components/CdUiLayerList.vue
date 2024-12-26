<script setup lang="ts">
const instance = useInstance()

const activeId = computed({
    get: () => instance.activeLayerId,
    set: (value: string) => {
        instance.setActiveLayer(value)
    },
})

const layers = computed({
    get: () => instance.layers as ProjectDataLayer[],
    set: (value) => {
        value.forEach((l, i) => {
            l.order = value.length - i
        })

        value.sort((a, b) => b.order - a.order)

        instance.setLayers(value)
    },
})

function onSelect(id: string) {
    activeId.value = id
}

function onUpdate(id: string, layer: Partial<ProjectDataLayer>) {
    const newLayers = layers.value.slice().map((l) => ({ ...l }))

    const item = newLayers.find((l) => l.id === id)

    if (!item) {
        return
    }

    Object.assign(item, layer)

    layers.value = newLayers 
}


function addNew() {
    const index = layers.value.length + 1
    const id = createId()

    const newLayers = layers.value.slice().map((l) => ({ ...l }))

    const width = instance.width
    const height = instance.height

    const canvas = document.createElement('canvas')

    canvas.width = width
    canvas.height = height

    newLayers.unshift({
        id: id,
        type: 'paint',
        name: 'Layer ' + index,
        order: index,
        canvas: canvas,
        width: width,
        height: height,
        visible: true,
    })

    layers.value = newLayers
    activeId.value = id

    instance.tools.history.add('addLayer')
}

function onRemove(id: string) {
    const newLayers = layers.value.slice().map((l) => ({ ...l }))

    const index = newLayers.findIndex((l) => l.id === id)

    if (index === -1) {
        return
    }

    newLayers.splice(index, 1)

    layers.value = newLayers

    instance.tools.history.add('removeLayer')
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

    instance.tools.history.add('moveLayer')
}

const menu = ref(false)
</script>
<template>
    <cd-menu v-model="menu" :close-on-content-click="false">
        <template #activator="{ attrs }">
            <cd-btn v-bind="attrs" variant="text" padding="none" size="md">
                <cd-icon name="heroicons:square-2-stack-solid" />
            </cd-btn>
        </template>

        <div class="p-2">
            <cd-card class="w-96 bg-body-900">
                <cd-card-head>
                    <cd-card-title class="mr-auto text-base">Layers</cd-card-title>

                    <cd-btn variant="text" padding="none" size="sm" @click="addNew">
                        <cd-icon name="heroicons:plus-20-solid" />
                    </cd-btn>
                </cd-card-head>

                <cd-drag-zone @drop="onDrop">
                    <cd-drag-item v-for="l in layers" :key="l.id" :model-value="l">
                        <cd-ui-layer-list-item
                            :layer="l"
                            :active="l.id === activeId"
                            @select="onSelect(l.id)"
                            @remove="onRemove(l.id)"
                            @update="onUpdate(l.id, $event)"
                        />
                    </cd-drag-item>
                </cd-drag-zone>
            </cd-card>
        </div>
    </cd-menu>
</template>
