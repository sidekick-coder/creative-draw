<script setup lang="ts">
import type { Layer } from '@/composables/useInstance'

const layer = defineModel({
    type: Object as PropType<Layer>,
    required: true,
})

const width = defineProp<number>('width', {
    type: Number,
    default: 50,
})

const height = computed(() => (width.value / layer.value.data.width) * layer.value.data.height)

const canvas = ref<HTMLCanvasElement>()
let interval: NodeJS.Timeout

function render() {
    if (!canvas.value) return

    const ctx = canvas.value.getContext('2d')!

    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
        layer.value.data,
        0,
        0,
        layer.value.data.width,
        layer.value.data.height,
        0,
        0,
        canvas.value.width,
        canvas.value.height
    )
}

onMounted(() => {
    if (!canvas.value) return

    canvas.value.width = width.value
    canvas.value.height = height.value

    interval = setInterval(() => render(), 16)
})

onUnmounted(() => {
    clearInterval(interval)
})

// class
const className = defineProp('class', {
    type: String,
    default: '',
})

const { classes, set } = useClassBuilder({
    class: className,
})

set('base', 'bg-body-200')
</script>
<template>
    <cd-card :class="classes">
        <canvas ref="canvas" :width :height />
    </cd-card>
</template>
