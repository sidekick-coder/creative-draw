<script setup lang="ts">
import type { LayerObject } from '@/composables/createLayer'
import type { ColorRGB } from '@/utils/colors'

const layers = defineModel<Layer[]>('layers', {
    type: Array as PropType<Layer[]>,
    default: () => [],
})

const selectedLayerId = ref<string | undefined>(layers.value[0]?.id)

const selectedLayer = computed(() => layers.value.find((l) => l.id === selectedLayerId.value))

const layerObjects = ref<LayerObject[]>([])

function loadObjects() {
    layerObjects.value = selectedLayer.value ? selectedLayer.value.context.get('data', []) : []
}

if (!selectedLayer.value && layers.value.length > 0) {
    selectedLayerId.value = layers.value[0].id
}

onMounted(loadObjects)

watch(selectedLayerId, loadObjects)

function applyStrokeColor(obj: LayerObject, color: ColorRGB) {
    if (!selectedLayer.value) return

    obj.color = { ...color }

    selectedLayer.value.update(obj.id, {
        ...obj,
        color: { ...color },
    })

    selectedLayer.value.redraw()
}
</script>

<template>
    <cd-card color="none" class="rounded-none border-0 min-w-72">
        <cd-card-head class="border-b border-body-600">
            <cd-card-title class="mr-auto text-sm font-bold text-body-100">
                {{ $t('Objects') }}
                <span class="ml-1 text-body-400 font-normal text-xs"
                    >({{ layerObjects.length }})</span
                >
            </cd-card-title>

            <cd-btn variant="text" size="sq-sm" @click="loadObjects">
                <cd-icon name="heroicons:arrow-path-20-solid" />
            </cd-btn>
        </cd-card-head>

        <div class="px-3 py-2 border-b border-body-600">
            <cd-select
                v-model="selectedLayerId"
                :options="layers"
                value-key="id"
                label-key="name"
            />
        </div>

        <div
            v-if="!selectedLayer || layerObjects.length === 0"
            class="px-4 py-3 text-xs text-body-100"
        >
            {{ $t('No objects') }}
        </div>

        <div v-else class="max-h-96 overflow-y-auto">
            <div
                v-for="o in layerObjects"
                :key="o.id"
                class="flex items-center gap-x-3 px-4 py-4 border-b border-body-700 text-body-0"
            >
                <div class="flex items-center gap-x-4 flex-1">
                    <cd-icon name="mdi:vector-square" class="text-body-100 text-lg shrink-0" />
                    <span class="truncate text-base">{{ o.type ?? 'object' }}</span>
                </div>
                <cd-color-picker
                    v-if="o.type === 'stroke'"
                    :model-value="o.color"
                    class="ml-auto"
                    @update:model-value="applyStrokeColor(o, $event)"
                />
                <span v-else class="ml-auto text-sm font-mono shrink-0">
                    {{ o.id.slice(0, 6) }}
                </span>
            </div>
        </div>
    </cd-card>
</template>
