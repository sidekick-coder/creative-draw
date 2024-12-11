<script setup lang="ts">
const brush = defineProp<BrushDefinition>('brush', {
    type: Object,
    required: true,
})

const canvas = ref<HTMLCanvasElement>()

onMounted(() => {
    if (!canvas.value) {
        return
    }

    const ctx = canvas.value.getContext('2d')!

    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    draw({
        ctx,
        brush: brush.value,
        color: { r: 255, g: 255, b: 255 },

        x: canvas.value.width - brush.value.size,
        y: canvas.value.height / 2,
        pressure: 0.1,

        lastX: brush.value.size,
        lastY: canvas.value.height / 2,
        lastPressure: 1,
    })
})
</script>
<template>
    <canvas ref="canvas" width="200" :height="brush.size + 20" class="w-full rounded"></canvas>
</template>
