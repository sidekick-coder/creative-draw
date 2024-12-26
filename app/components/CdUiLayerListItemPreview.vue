<script setup lang="ts">
const layer = defineModel({
    type: Object as PropType<ProjectDataLayer>,
    required: true,
})

const width = defineProp<number>('width', {
    type: Number,
    default: 50,
})

const height = computed(() => (width.value / layer.value.canvas.width) * layer.value.canvas.height)

const canvas = ref<HTMLCanvasElement>()
let interval: NodeJS.Timeout

function render() {
    if (!canvas.value) return

    const ctx = canvas.value.getContext('2d')!

    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
        layer.value.canvas,
        0,
        0,
        layer.value.canvas.width,
        layer.value.canvas.height,
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

    render()

    interval = setInterval(render, 1000 * 60) // 1 minute
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

set('base', 'bg-body-0')
</script>
<template>
    <cd-card :class="classes">
        <canvas ref="canvas" :width :height />
    </cd-card>
</template>
