<script setup lang="ts">
import debounce from 'lodash/debounce'

const instance = useInstance()

const isDrawing = ref(false)
const lastX = ref(0)
const lastY = ref(0)
const lastPressure = ref(0)

const createDrawCheckpoint = debounce(() => {
    instance.tools.history.add('draw')
}, 1000)

function start(data: InstanceEvents['layer:pointerdown']) {
    createDrawCheckpoint()

    isDrawing.value = true
    lastX.value = data.x
    lastY.value = data.y
}

const brush = computed(() => instance.tools.brush.settings)

function onDraw(data: InstanceEvents['layer:pointermove']) {
    if (!isDrawing.value || !brush.value) return

    if (instance.activeTool !== 'brush') return

    draw({
        ctx: data.ctx,
        brush: brush.value,
        color: instance.tools.color.color,

        x: data.x,
        y: data.y,
        pressure: data.pressure,

        lastX: lastX.value,
        lastY: lastY.value,
        lastPressure: lastPressure.value,
    })

    lastX.value = data.x
    lastY.value = data.y
    lastPressure.value = data.pressure
}

function end() {
    isDrawing.value = false
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
