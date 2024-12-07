<script setup lang="ts">
const instance = useInstance()

const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)
const lastPressure = ref(0)

function start(data: InstanceEvents['layer:pointerdown']) {
    isDrawing.value = true
    lastX.value = data.x
    lastY.value = data.y
}

function draw(data: InstanceEvents['layer:pointermove']) {
    if (!isDrawing.value || !instance.activeBrush) return

    const brush = instance.activeBrush

    const startX = lastX.value
    const startY = lastY.value
    const startPressure = lastPressure.value

    const endX = data.x
    const endY = data.y
    const endPressure = data.pressure

    const gap = 0.1

    const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)
    const steps = Math.floor(distance / gap)
    const map = new Map<string, { x: number; y: number; pressure: number }>()

    for (let i = 0; i < steps; i++) {
        const t = i / steps
        const x = startX + t * (endX - startX)
        const y = startY + t * (endY - startY)
        const pressure = startPressure + t * (endPressure - startPressure)

        const key = `${Math.round(x)}-${Math.round(y)}`

        map.set(key, { x, y, pressure })
    }

    const points = Array.from(map.values())

    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]

        if (!p1) continue

        let size = brush.size
        let opacity = brush.opacity
        let color = brush.color || { r: 0, g: 0, b: 0 }

        // if (brush.enable_opacity_pressure) {
        //     opacity *= p1.pressure
        // }
        //
        // if (brush.enable_size_pressure) {
        //     size *= p1.pressure
        // }

        data.ctx.globalAlpha = opacity
        data.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`

        data.ctx.beginPath()
        data.ctx.arc(p1.x, p1.y, size / 2, 0, Math.PI * 2)
        data.ctx.fill()
        data.ctx.closePath()
    }

    lastX.value = data.x
    lastY.value = data.y
    lastPressure.value = data.pressure
}

function end() {
    isDrawing.value = false
}

onMounted(() => {
    instance.on('layer:pointerdown', start)
    instance.on('layer:pointermove', draw)
    instance.on('layer:pointerup', end)
})

onUnmounted(() => {
    instance.off('layer:pointerdown', start)
    instance.off('layer:pointermove', draw)
    instance.off('layer:pointerup', end)
})
</script>

<template>
    <div class="brush hidden"></div>
</template>
