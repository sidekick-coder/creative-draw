<script setup lang="ts">
const instance = useInstance()

const activeId = computed({
    get: () => instance.activeLayerId,
    set: (value: string) => {
        instance.setActiveLayer(value)
    },
})

const layers = computed({
    get: () => instance.layers || [] as ProjectDataLayer[],
    set: (value: ProjectDataLayer[]) => {
        value.forEach((l, i) => {
            l.order = value.length - i
        })

        value.sort((a, b) => b.order - a.order)

        instance.setLayers(value)
    },
})

function onClick(id: string) {
    activeId.value = id
}

const editId = ref<string>()

function onChangeName(id: string, event: Event) {
    const input = event.target as HTMLInputElement

    const newLayers = layers.value.slice().map((l) => ({ ...l })) as ProjectDataLayer[]

    const item = newLayers.find((l) => l.id === id)

    if (!item) {
        return
    }

    item.name = input.value

    layers.value = newLayers
}

function addNew() {
    const index = layers.value.length + 1
    const id = createId()

    const newLayers = layers.value.slice().map((l) => ({ ...l })) as ProjectDataLayer[]

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
}

function remove(id: string) {
    const newLayers = layers.value.slice().map((l) => ({ ...l })) as ProjectDataLayer[]

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

    let newLayers = layers.value.slice().map((l) => ({ ...l })) as ProjectDataLayer[]

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
    const newLayers = layers.value.slice().map((l) => ({ ...l })) as ProjectDataLayer[]

    const item = newLayers.find((l) => l.id === id)

    if (!item) {
        return
    }

    item.visible = !item.visible

    layers.value = newLayers
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
                        <cd-list-item class="group flex" :active="l.id === activeId" @click="onClick(l.id)">
                            <cd-ui-layer-preview v-if="menu" :model-value="l" />

                            <div class="flex-1 text-sm text-body-0" @dblclick="editId = l.id">
                                <input :value="l.name" class="h-10 w-full bg-body-600 px-4 focus:outline-none" :class="editId === l.id
                                        ? 'bg-body-600'
                                        : 'bg-transparent cursor-pointer'
                                    " autofocus :readonly="editId !== l.id" @change="onChangeName(l.id, $event)"
                                    @blur="editId = undefined" />
                            </div>

                            <div class="flex">
                                <cd-btn variant="text" padding="none" size="sm" color="none"
                                    class="text-body-100 hover:text-body-50" @click="remove(l.id)">
                                    <cd-icon name="heroicons:trash-20-solid" />
                                </cd-btn>

                                <cd-btn variant="text" padding="none" color="none"
                                    class="text-body-100 hover:text-body-50" size="sm"
                                    @click.stop="toggleVisible(l.id)">
                                    <cd-icon v-if="l.visible" name="heroicons:eye-20-solid" />
                                    <cd-icon v-else name="heroicons:eye-slash-20-solid" />
                                </cd-btn>
                            </div>
                        </cd-list-item>
                    </cd-drag-item>
                </cd-drag-zone>
            </cd-card>
        </div>
    </cd-menu>
</template>
