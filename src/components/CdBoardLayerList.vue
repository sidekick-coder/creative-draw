<script setup lang="ts">
const layers = defineModel<Layer[]>('layers', {
    type: Array as PropType<Layer[]>,
    default: () => [],
})

const activeLayerId = defineModel<string | undefined>('activeLayerId', {
    type: String,
})

// layer type helpers — type and parent_id are stored in the layer context

function isGroup(layer: Layer): boolean {
    return layer.context.get('type', '') === 'group'
}

function getParentId(layer: Layer): string | null {
    return layer.context.get('parent_id', '') || null
}

// collapsed state

const collapsedGroups = ref<Set<string>>(new Set())

function isLayerVisible(layer: Layer): boolean {
    const parentId = getParentId(layer)
    return !parentId || !collapsedGroups.value.has(parentId)
}

function toggleGroupCollapse(layerId: string) {
    const next = new Set(collapsedGroups.value)
    if (next.has(layerId)) next.delete(layerId)
    else next.add(layerId)
    collapsedGroups.value = next
}

// layer operations

function addLayer() {
    const newLayer = createLayer({ name: 'New Layer' })
    layers.value = [newLayer, ...layers.value]
    activeLayerId.value = newLayer.id
}

function addGroup() {
    const groupLayer = createLayer({ name: 'New Group' })
    groupLayer.set('type', 'group')
    layers.value = [groupLayer, ...layers.value]
}

function moveLayer(layer: Layer, direction: 'up' | 'down') {
    const arr = layers.value.slice()
    const index = arr.indexOf(layer)
    if (index === -1) return

    if (direction === 'up' && index > 0) {
        arr.splice(index, 1)
        arr.splice(index - 1, 0, layer)
    } else if (direction === 'down' && index < arr.length - 1) {
        arr.splice(index, 1)
        arr.splice(index + 1, 0, layer)
    }

    layers.value = arr
}

function deleteLayer(layer: Layer) {
    const index = layers.value.indexOf(layer)
    if (index === -1) return

    let filtered = layers.value.filter((l) => l.id !== layer.id)

    if (isGroup(layer)) {
        filtered = filtered.filter((l) => getParentId(l) !== layer.id)
    }

    layers.value = filtered

    if (activeLayerId.value === layer.id) {
        activeLayerId.value = layers.value[Math.max(0, index - 1)]?.id
    }
}

// drag & drop — flat list reorder

const draggingLayerId = ref<string | null>(null)
const dragOverLayerId = ref<string | null>(null)
const dragOverPosition = ref<'before' | 'after'>('before')

function onDragStart(event: DragEvent, layer: Layer) {
    draggingLayerId.value = layer.id
    event.dataTransfer!.effectAllowed = 'move'
    event.dataTransfer!.setData('layerId', layer.id)
}

function onDragEnd() {
    draggingLayerId.value = null
    dragOverLayerId.value = null
}

function onDragOver(event: DragEvent, layer: Layer) {
    event.preventDefault()
    event.dataTransfer!.dropEffect = 'move'
    dragOverLayerId.value = layer.id
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
    dragOverPosition.value = event.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
}

function onDragLeaveContainer(event: DragEvent) {
    const container = event.currentTarget as HTMLElement
    if (!container.contains(event.relatedTarget as Node)) {
        dragOverLayerId.value = null
    }
}

function onDrop(event: DragEvent, targetLayer: Layer) {
    event.preventDefault()
    const sourceId = draggingLayerId.value
    if (!sourceId || sourceId === targetLayer.id) {
        onDragEnd()
        return
    }

    const arr = layers.value.slice()
    const sourceIndex = arr.findIndex((l) => l.id === sourceId)
    const targetIndex = arr.findIndex((l) => l.id === targetLayer.id)

    if (sourceIndex === -1 || targetIndex === -1) {
        onDragEnd()
        return
    }

    const [item] = arr.splice(sourceIndex, 1)
    const adjustedTarget = targetIndex > sourceIndex ? targetIndex - 1 : targetIndex
    const insertAt = dragOverPosition.value === 'before' ? adjustedTarget : adjustedTarget + 1
    arr.splice(insertAt, 0, item)
    layers.value = arr

    onDragEnd()
}
</script>
<template>
    <cd-card color="none" class="rounded-none border-0" @dragleave="onDragLeaveContainer">
        <!-- header -->
        <cd-card-head class="border-b border-body-600">
            <cd-card-title class="mr-auto text-sm font-bold text-body-100">
                {{ $t('Layers') }}
            </cd-card-title>

            <cd-btn variant="text" size="sq-sm" @click="addLayer">
                <cd-icon name="heroicons:plus-20-solid" />
            </cd-btn>

            <cd-btn variant="text" size="sq-sm" @click="addGroup">
                <cd-icon name="mdi:folder-plus-outline" />
            </cd-btn>
        </cd-card-head>

        <!-- flat layer list -->
        <template v-for="layer in layers" :key="layer.id">
            <div
                v-if="isLayerVisible(layer)"
                draggable="true"
                class="border-b-2 border-t-2 border-transparent transition-colors"
                :class="[
                    draggingLayerId === layer.id ? 'opacity-40' : '',
                    dragOverLayerId === layer.id && dragOverPosition === 'before'
                        ? '!border-t-primary-400'
                        : '',
                    dragOverLayerId === layer.id && dragOverPosition === 'after'
                        ? '!border-b-primary-400'
                        : '',
                ]"
                @dragstart="onDragStart($event, layer)"
                @dragend="onDragEnd"
                @dragover="onDragOver($event, layer)"
                @drop="onDrop($event, layer)"
            >
                <!-- group row -->
                <cd-card-head
                    v-if="isGroup(layer)"
                    class="border-b border-body-600 !py-0 !px-2 bg-body-800 gap-x-0"
                >
                    <cd-btn
                        size="none"
                        color="none"
                        class="p-2"
                        @click="toggleGroupCollapse(layer.id)"
                    >
                        <div class="size-12 flex items-center justify-center gap-x-1 text-body-300">
                            <cd-icon name="mdi:folder-outline" class="text-xl" />
                            <cd-icon
                                :name="
                                    collapsedGroups.has(layer.id)
                                        ? 'heroicons:chevron-right-20-solid'
                                        : 'heroicons:chevron-down-20-solid'
                                "
                                class="text-xs"
                            />
                        </div>
                    </cd-btn>

                    <input
                        :value="layer.name"
                        class="flex-1 h-12 bg-transparent text-sm text-body-0 focus:outline-none min-w-0 px-2"
                        @change="layer.name = ($event.target as HTMLInputElement).value"
                    />

                    <div class="flex items-center">
                        <cd-btn
                            size="sq-md"
                            variant="text"
                            @click="layer.visible = !layer.visible"
                        >
                            <cd-icon
                                v-if="layer.visible"
                                name="heroicons:eye-16-solid"
                            />
                            <cd-icon v-else name="heroicons:eye-slash-16-solid" />
                        </cd-btn>

                        <cd-btn
                            size="sq-md"
                            variant="text"
                            color="danger"
                            @click="deleteLayer(layer)"
                        >
                            <cd-icon name="heroicons:trash-20-solid" />
                        </cd-btn>
                    </div>
                </cd-card-head>

                <!-- normal layer row -->
                <cd-board-layer-list-item
                    v-else
                    v-model:active-id="activeLayerId"
                    :layer="layer"
                    :class="getParentId(layer) ? 'pl-6' : ''"
                    @move-up="moveLayer(layer, 'up')"
                    @move-down="moveLayer(layer, 'down')"
                    @delete="deleteLayer(layer)"
                />
            </div>
        </template>
    </cd-card>
</template>
