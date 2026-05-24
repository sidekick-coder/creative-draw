<script setup lang="ts">
import type { LayerObject } from '@/composables/createLayer'

const board = useBoard()
const layers = computed(() => board.layers)
const { layerId, objectId } = useInspectorOptions(board)

const selectedLayer = ref<Layer | undefined>()
const selectedObject = ref<LayerObject | undefined>()

function load() {
    const layer = layers.value.find((l) => l.id === layerId.value)

    if (!layer) {
        selectedLayer.value = undefined
        selectedObject.value = undefined
        return
    }

    selectedLayer.value = layer

    const object = layer.context.get('data', []).find((o: LayerObject) => o.id === objectId.value)

    if (!object) {
        selectedObject.value = undefined
        return
    }

    selectedObject.value = object
}

watch([layerId, objectId], load)
onMounted(load)
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
            <cd-object-inspect-form-stroke
                v-if="selectedObject.type === 'stroke'"
                :object="selectedObject"
                :layer="selectedLayer"
            />
            <cd-object-inspect-form-rect
                v-else-if="selectedObject.type === 'rect'"
                :object="selectedObject"
                :layer="selectedLayer"
            />
            <cd-object-inspect-form-ellipse
                v-else-if="selectedObject.type === 'ellipse'"
                :object="selectedObject"
                :layer="selectedLayer"
            />
        </template>

        <div v-else class="px-4 py-6 text-xs text-body-400 text-center">
            {{ $t('No object selected') }}
        </div>
    </cd-card>
</template>
