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

type EventParementer = {
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
    x: number
    y: number
    pressure: number
}

function start(data: EventParementer) {
    if (!brush.value) return

    if (instance.activeTool !== 'brush') return

    createDrawCheckpoint()

    isDrawing.value = true
    lastX.value = data.x
    lastY.value = data.y
}

const brush = computed(() => instance.tools.brush.settings)

function draw(data: EventParementer) {
    if (!isDrawing.value || !brush.value) return

    if (instance.activeTool !== 'brush') return

    drawBrush({
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

// pointer events / pen events
onInstanceEvent('layer:pointerdown', (data) => {
    if (data.event.pointerType !== 'pen') return

    data.event.preventDefault()
    data.event.stopPropagation()

    start(data)
})

onInstanceEvent('layer:pointermove', draw)
onInstanceEvent('layer:pointerup', end)
onInstanceEvent('layer:pointerout', end)

// touch events
onInstanceEvent('layer:touchstart', (data) => {
    data.event.preventDefault()

    if (data.event.touches.length > 1) {
        end()
    }

    if (data.event.touches.length === 1) {
        start(data)
    }
})

onInstanceEvent('layer:touchmove', (data) => {
    if (data.event.touches.length === 1) {
        draw(data)
    }
})

onInstanceEvent('layer:touchend', (data) => {
    if (data.event.touches.length === 1) {
        end()
    }
})

onInstanceEvent('layer:mousedown', (data) => {
    start({
        ctx: data.ctx,
        x: data.x,
        y: data.y,
        pressure: 0.5,
    })
})

onInstanceEvent('layer:mousemove', (data) => {
    draw({
        ctx: data.ctx,
        x: data.x,
        y: data.y,
        pressure: 0.5,
    })
})
</script>

<template>
    <div class="brush hidden"></div>
</template>
