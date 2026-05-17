<script setup lang="ts">
import type { LayerObject } from '@/composables/createLayer'
import type { ColorRGB } from '@/utils/colors'
import { useDebounceFn } from '@vueuse/core'

const props = defineProps<{
    object: LayerObject
    layer: Layer
}>()

const color = ref<ColorRGB>({ ...props.object.color })
const strokeWidth = ref<number>(props.object.strokeWidth ?? 2)
const opacity = ref<number>(props.object.opacity ?? 1)

watch(() => props.object.id, () => {
    color.value = { ...props.object.color }
    strokeWidth.value = props.object.strokeWidth ?? 2
    opacity.value = props.object.opacity ?? 1
})

const save = useDebounceFn(() => {
    props.layer.update(props.object.id, {
        color: { ...color.value },
        strokeWidth: strokeWidth.value,
        opacity: opacity.value,
    })
    props.layer.redraw()
}, 300)

watch([color, strokeWidth, opacity], save, { deep: true })
</script>

<template>
    <div class="flex items-center gap-x-3 px-4 py-3 border-b border-body-700">
        <span class="text-xs text-body-300 flex-1">{{ $t('Color') }}</span>
        <cd-color-picker v-model="color" />
    </div>
    <div class="flex items-center gap-x-3 px-4 py-3 border-b border-body-700">
        <span class="text-xs text-body-300 flex-1">{{ $t('Size') }}</span>
        <cd-text-field v-model="strokeWidth" type="number" min="1" class="w-20" />
    </div>
    <div class="flex items-center gap-x-3 px-4 py-3 border-b border-body-700">
        <span class="text-xs text-body-300 flex-1">{{ $t('Opacity') }}</span>
        <cd-text-field v-model="opacity" type="number" min="0" max="1" step="0.01" class="w-20" />
    </div>
</template>
