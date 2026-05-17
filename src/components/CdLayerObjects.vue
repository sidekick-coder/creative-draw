<script setup lang="ts">
import type { LayerObject } from '@/composables/createLayer'

interface LayerObjectWithMeta extends LayerObject {
    _layerName: string
    _layer: Layer
}

const board = useBoard()
const layers = computed(() => board.layers)
const inspectorLayerId = board.context.createRef<string | null>('inspectorLayerId', null)
const inspectorObjectId = board.context.createRef<string | null>('inspectorObjectId', null)

const allObjects = ref<LayerObjectWithMeta[]>([])

function load() {
    const objects: LayerObjectWithMeta[] = []

    layers.value.forEach((layer) => {
        const data: LayerObject[] = layer.context.get('data', [])

        data.forEach((object) => {
            objects.push({
                ...object,
                _layerName: layer.name,
                _layer: layer,
            })
        })
    })

    allObjects.value = objects
}

function selectObject(obj: LayerObjectWithMeta) {
    inspectorLayerId.value = obj._layer.id
    inspectorObjectId.value = obj.id
}

function onLayerLoad(layer: Layer) {
    layer.emitter.on('object:added', load)
    layer.emitter.on('object:updated', load)
    layer.emitter.on('object:removed', load)
}

function offLayerLoad(layer: Layer) {
    layer.emitter.off('object:added', load)
    layer.emitter.off('object:updated', load)
    layer.emitter.off('object:removed', load)
}

function init() {
    layers.value.forEach(offLayerLoad)
    layers.value.forEach(onLayerLoad)

    load()
}

board.emitter.on('layer:added', init)
</script>

<template>
    <cd-card color="none" class="rounded-none border-0 min-w-72">
        <cd-card-head class="border-b border-body-600">
            <cd-card-title class="mr-auto text-sm font-bold text-body-100">
                {{ $t('Objects') }}
                <span class="ml-1 text-body-400 font-normal text-xs"
                    >({{ allObjects.length }})</span
                >
            </cd-card-title>
            <cd-btn size="sq-sm" color="body-900" @click.stop.prevent="load">
                <cd-icon name="heroicons:arrow-path" />
            </cd-btn>
        </cd-card-head>

        <div v-if="allObjects.length === 0" class="px-4 py-3 text-xs text-body-100">
            {{ $t('No objects') }}
        </div>

        <div v-else class="max-h-96 overflow-y-auto">
            <div
                v-for="o in allObjects"
                :key="o.id"
                class="flex items-center gap-x-3 px-4 py-4 border-b border-body-700 text-body-0 cursor-pointer hover:bg-body-800"
                :class="inspectorObjectId === o.id ? 'bg-body-800' : ''"
                @click="selectObject(o)"
            >
                <div class="flex items-center gap-x-4 flex-1 min-w-0">
                    <cd-icon name="mdi:vector-square" class="text-body-100 text-lg shrink-0" />
                    <div class="flex flex-col min-w-0">
                        <span class="truncate text-base">{{ o.type ?? 'object' }}</span>
                        <span class="truncate text-xs text-body-400">{{ o._layerName }}</span>
                    </div>
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
