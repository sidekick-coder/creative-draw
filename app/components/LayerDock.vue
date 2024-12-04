<script setup lang="ts">
import orderBy from 'lodash/orderBy'

const model = defineModel({
    type: String,
    required: true,
})

const project = defineProp<ProjectParsed>('project', {
    type: Object,
    required: true,
})

const layers = defineModel('layers', {
    type: Array as PropType<Layer[]>,
    default: () => [],
})

function onClick(layer: Layer) {
    model.value = layer.id
}

function onChangeName(layer: Layer, event: Event) {
    const input = event.target as HTMLInputElement

    const regex = /^[a-zA-Z0-9_]+$/

    if (!regex.test(input.value)) {
        input.value = layer.name
        return
    }
}

function addNew() {
    const index = layers.value.length + 1
    const id = window.crypto.randomUUID()

    layers.value.push({
        id: id,
        type: 'paint',
        name: 'Layer ' + index,
        order: index,
        visible: true,
        data: new Uint8Array(project.value.width * project.value.height * 4),
        width: project.value.width,
        height: project.value.height,
    })

    project.value.selected_layer = id
}

function remove(layer: Layer) {
    const index = layers.value.findIndex((l) => l.id === layer.id)

    if (index === -1) {
        return
    }

    layers.value.splice(index, 1)
}

function onDrop({ item, dropTarget }: any) {
    if (!item || !dropTarget) {
        return
    }

    let newLayers: Layer[] = layers.value.slice().map((l) => ({ ...l }))

    const currentIndex = newLayers.findIndex((l) => l.id === item.id)
    const targetIndex = newLayers.findIndex((l) => l.id === dropTarget.id)

    if (currentIndex === -1 || targetIndex === -1) {
        return
    }

    const [removedItem] = newLayers.splice(currentIndex, 1)

    newLayers.splice(targetIndex, 0, removedItem!)

    newLayers.forEach((l, i) => {
        l.order = newLayers.length - i
    })

    newLayers.sort((a, b) => b.order - a.order)

    layers.value = newLayers
}
</script>
<template>
    <cd-card class="w-96" color="body-800">
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
                    :active="l.id === modelValue"
                    @click="onClick(l)"
                >
                    <layer-preview :model-value="l" />

                    <div class="flex-1">
                        <input
                            :value="l.name"
                            class="h-10 w-full bg-transparent px-4 text-sm text-body-0 hover:bg-body-800 focus:bg-body-600 focus:outline-none"
                            @change="onChangeName(l, $event)"
                            @click.stop
                        />
                    </div>

                    <div class="flex opacity-0 group-hover:opacity-100">
                        <cd-btn variant="text" padding="none" size="sm" @click="remove(l)">
                            <cd-icon name="heroicons:trash-20-solid" />
                        </cd-btn>

                        <cd-btn
                            variant="text"
                            padding="none"
                            size="sm"
                            @click.stop="() => (l.visible = !l.visible)"
                        >
                            <cd-icon v-if="l.visible" name="heroicons:eye-20-solid" />
                            <cd-icon v-else name="heroicons:eye-slash-20-solid" />
                        </cd-btn>
                    </div>
                </cd-list-item>
            </cd-drag-item>
        </cd-drag-zone>
    </cd-card>
</template>
