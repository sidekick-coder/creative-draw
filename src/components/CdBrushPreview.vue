<script setup lang="ts">
const brush = defineProp<BrushDefinition>('brush', {
    type: Object,
    required: true,
})

const canvas = ref<HTMLCanvasElement>()
const height = 10
const width = 200

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
        lastPressure: 0.5,
        pressure: 1,
        size: 2,
        opacity: 1,
        color: { r: 255, g: 255, b: 255 },
    })

    paths.forEach((p) => {
        const opacity = Math.max(p.opacity || 1, 0.05)

        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = opacity
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${opacity})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    })
}
onMounted(load)
</script>
<template>
    <canvas ref="canvas" :width :height class="w-full rounded"></canvas>
</template>
