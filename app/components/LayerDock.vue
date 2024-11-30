<script setup lang="ts">
import orderBy from 'lodash/orderBy'

const model = defineModel({
    type: String,
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
</script>
<template>
    <cd-card class="w-96" color="body-800">
        <cd-card-head>
            <cd-card-title class="mr-auto text-base">Layers</cd-card-title>

            <cd-btn variant="text" padding="none" size="sm">
                <cd-icon name="heroicons:plus-20-solid" />
            </cd-btn>
        </cd-card-head>

        <cd-list-item
            v-for="l in orderBy(layers, 'order', 'desc')"
            :key="l.name"
            class="group flex"
            :active="l.id === modelValue"
            @click="onClick(l)"
        >
            <layer-preview :model-value="l" />

            <div class="flex-1">
                <input
                    :value="l.name"
                    class="h-10 w-full bg-transparent px-4 text-sm text-body-0 hover:bg-body-800 focus:bg-body-800 focus:outline-none"
                    @change="onChangeName(l, $event)"
                />
            </div>

            <div class="flex opacity-0 group-hover:opacity-100">
                <cd-btn variant="text" padding="none" size="sm">
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
    </cd-card>
</template>
