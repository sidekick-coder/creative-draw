<script setup lang="ts">
import { parsePath } from '@/utils/drawBrushPaths'

const brush = defineProp<BrushDefinition>('brush', {
    type: Object,
    required: true,
})

const canvas = ref<HTMLCanvasElement>()
const height = 40
const width = 320

function load() {
    if (!canvas.value) {
        return
    }

    const ctx = canvas.value.getContext('2d')!

    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    const paths = brush.value.draw({
        x: width - 10,
        y: height / 2,
        lastX: 1,
        lastY: height / 2,
        lastPressure: 1,
        pressure: 1,
        size: 6,
        opacity: 1,
        color: { r: 255, g: 255, b: 255 },
    })

    paths.forEach((p) => {
        const { x, y, size } = parsePath(p)

        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = `rgb(255, 255, 255)`
        ctx.beginPath()
        ctx.arc(x, y, size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    })
}
onMounted(load)
</script>
<template>
    <canvas ref="canvas" :width :height class="w-full rounded"></canvas>
</template>
