<script setup lang="ts">
import type { LayerObject } from '@/composables/createLayer'

const layers = defineModel<Layer[]>('layers', {
    type: Array as PropType<Layer[]>,
    default: () => [],
})

const selectedLayerId = defineModel<string | undefined>('selectedLayerId')
const selectedObjectId = defineModel<string | undefined>('selectedObjectId')

const selectedLayer = ref<Layer | undefined>()
const selectedObject = ref<LayerObject | undefined>()

watch([selectedLayerId, selectedObjectId], ([layerId, objectId]) => {
    selectedLayer.value = layers.value.find((l) => l.id === layerId)

    if (!selectedLayer.value || !objectId) {
        selectedObject.value = undefined
        return
    }

    const data: LayerObject[] = selectedLayer.value.context.get('data', [])
    selectedObject.value = data.find((o) => o.id === objectId)
})
</script>

<template>
    <cd-card color="none" class="rounded-none border-0 min-w-72">
        <cd-card-head class="border-b border-body-600">
            <cd-card-title class="mr-auto text-sm font-bold text-body-100">
                {{ $t('Inspector') }}
            </cd-card-title>
        </cd-card-head>

        <template v-if="selectedObject && selectedLayer">
            <cd-object-inspector-stroke
                v-if="selectedObject.type === 'stroke'"
                :object="selectedObject"
                :layer="selectedLayer"
            />
        </template>

        <div v-else class="px-4 py-6 text-xs text-body-400 text-center">
            {{ $t('No object selected') }}
        </div>
    </cd-card>
</template>
