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

onMounted(loadObjects)

watch(selectedLayerId, loadObjects)

// stroke color dialog

const strokeDialogOpen = ref(false)
const editingObject = ref<LayerObject | null>(null)
const editingColor = ref<ColorRGB>({ r: 0, g: 0, b: 0 })

function onItemClick(obj: LayerObject) {
    if (obj.type !== 'stroke') return

    editingObject.value = obj
    editingColor.value = { ...obj.color }
    strokeDialogOpen.value = true
}

function applyStrokeColor() {
    if (!editingObject.value || !selectedLayer.value) return

    editingObject.value.color = { ...editingColor.value }

    selectedLayer.value.update(editingObject.value.id, {
        ...editingObject.value,
        color: { ...editingColor.value },
    })

    selectedLayer.value.redraw()

    strokeDialogOpen.value = false
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
                class="flex items-center gap-x-3 px-4 py-4 border-b border-body-700 text-body-0 hover:bg-body-800"
                :class="o.type === 'stroke' ? 'cursor-pointer' : ''"
                @click="onItemClick(o)"
            >
                <cd-icon name="mdi:vector-square" class="text-body-100 text-base shrink-0" />
                <span class="truncate text-base">{{ o.type ?? 'object' }}</span>
                <div
                    v-if="o.type === 'stroke'"
                    class="ml-auto size-4 rounded-full shrink-0 border border-body-600"
                    :style="{
                        backgroundColor: `rgb(${o.color?.r || 0},${o.color?.g || 0},${o.color?.b || 0})`,
                    }"
                />
                <span v-else class="ml-auto text-sm font-mono shrink-0">
                    {{ o.id.slice(0, 6) }}
                </span>
            </div>
        </div>
    </cd-card>

    <cd-dialog v-model="strokeDialogOpen">
        <cd-card class="min-w-72">
            <cd-card-head class="border-b border-body-600">
                <cd-card-title class="mr-auto text-sm font-bold text-body-100">
                    {{ $t('Stroke color') }}
                </cd-card-title>
                <cd-btn variant="text" size="sq-sm" @click="strokeDialogOpen = false">
                    <cd-icon name="heroicons:x-mark-20-solid" />
                </cd-btn>
            </cd-card-head>
            <cd-card-content>
                <cd-color-picker v-model="editingColor" />
            </cd-card-content>
            <cd-card-footer class="flex justify-end gap-x-2">
                <cd-btn variant="text" @click="strokeDialogOpen = false">{{ $t('Cancel') }}</cd-btn>
                <cd-btn @click="applyStrokeColor">{{ $t('Apply') }}</cd-btn>
            </cd-card-footer>
        </cd-card>
    </cd-dialog>
</template>
