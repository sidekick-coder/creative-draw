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

const brush = computed(() => instance.tools.eraser.settings)

function onDraw(data: InstanceEvents['layer:pointermove']) {
    if (!isDrawing.value || !brush.value) return

    if (instance.activeTool !== 'eraser') return

    const eraser = copy(brush.value)

    eraser.opacity = 0

    drawBrush({
        ctx: data.ctx,
        brush: eraser,
        color: { r: 0, g: 0, b: 0 },

        x: data.x,
        y: data.y,
        pressure: data.pressure,

        lastX: lastX.value,
        lastY: lastY.value,
        lastPressure: lastPressure.value,
        globalCompositeOperation: 'destination-out',
    })

    lastX.value = data.x
    lastY.value = data.y
    lastPressure.value = data.pressure
}

function end() {
    if (!isDrawing.value) return

    if (instance.activeTool !== 'eraser') return

    isDrawing.value = false
    instance.tools.history.add('eraser')
}

onMounted(() => {
    instance.on('layer:pointerdown', start)
    instance.on('layer:pointermove', onDraw)
    instance.on('layer:pointerup', end)
})

onUnmounted(() => {
    instance.off('layer:pointerdown', start)
    instance.off('layer:pointermove', onDraw)
    instance.off('layer:pointerup', end)
})
</script>

<template>
    <div class="brush hidden"></div>
</template>
