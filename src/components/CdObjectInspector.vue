<script setup lang="ts">
import type { LayerObject } from '@/composables/createLayer'

const board = useBoard()
const layers = computed(() => board.layers)
const selectedLayerId = board.context.createRef<string | null>('inspectorLayerId', null)
const selectedObjectId = board.context.createRef<string | null>('inspectorObjectId', null)

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
            <div class="flex flex-col mr-auto">
                <cd-card-title class="text-sm font-bold text-body-100">
                    {{ selectedObject ? (selectedObject.type ?? 'object') : $t('Inspector') }}
                </cd-card-title>
                <span v-if="selectedLayer" class="text-xs text-body-400">
                    {{ selectedLayer.name }}
                </span>
            </div>
            <span v-if="selectedObject" class="text-xs text-body-400 font-mono ml-auto">
                {{ selectedObject.id.slice(0, 6) }}
            </span>
        </cd-card-head>

        <template v-if="selectedObject && selectedLayer">
            <cd-object-inspector-stroke
                v-if="selectedObject.type === 'stroke'"
                :object="selectedObject"
                :layer="selectedLayer"
            />
            <cd-object-inspector-rect
                v-else-if="selectedObject.type === 'rect'"
                :object="selectedObject"
                :layer="selectedLayer"
            />
        </template>

        <div v-else class="px-4 py-6 text-xs text-body-400 text-center">
            {{ $t('No object selected') }}
        </div>
    </cd-card>
</template>
