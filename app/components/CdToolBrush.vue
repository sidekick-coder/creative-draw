<script setup lang="ts">
const instance = useInstance()

const isDrawing = ref(false)
const currentDevice = ref('mouse')
const lastX = ref(0)
const lastY = ref(0)
const lastPressure = ref(0)

type EventParementer = {
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
    x: number
    y: number
    pressure: number
}

function start(data: EventParementer) {
    if (!brush.value) return

    if (instance.activeTool !== 'brush') return

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
    if (!isDrawing.value) return

    isDrawing.value = false

    instance.tools.history.add('draw')
}

// pointer events / pen events
onInstanceEvent('layer:pointerdown', (data) => {
    if (data.event.pointerType !== 'pen') return

    currentDevice.value = 'pen'

    start(data)
})

onInstanceEvent('layer:pointermove', (data) => {
    if (currentDevice.value !== 'pen') return

    draw(data)
})

onInstanceEvent('layer:pointerup', () => {
    if (currentDevice.value !== 'pen') return

    end()
})

onInstanceEvent('layer:pointerout', () => {
    if (currentDevice.value !== 'pen') return

    end()
})

// touch events
onInstanceEvent('layer:touchstart', (data) => {
    data.event.preventDefault()

    const touch = data.event.touches[0]

    if (!touch) return

    if (isDrawing.value) return

    if (data.event.touches.length === 1) {
        currentDevice.value = 'touch'
        data.event.preventDefault()
        data.event.stopPropagation()
        start(data)
    }
})

onInstanceEvent('layer:touchmove', (data) => {
    if (currentDevice.value !== 'touch') return

    if (data.event.touches.length === 1) {
        draw(data)
    }
})

onInstanceEvent('layer:touchend', () => {
    if (currentDevice.value !== 'touch') return

    end()
})

// mouse events
onInstanceEvent('layer:mousedown', (data) => {
    currentDevice.value = 'mouse'

    start({
        ctx: data.ctx,
        x: data.x,
        y: data.y,
        pressure: 0.5,
    })
})

onInstanceEvent('layer:mousemove', (data) => {
    if (currentDevice.value !== 'mouse') return

    draw({
        ctx: data.ctx,
        x: data.x,
        y: data.y,
        pressure: 0.5,
    })
})

onInstanceEvent('layer:mouseup', () => {
    if (currentDevice.value !== 'mouse') return

    end()
})
</script>

<template>
    <div class="brush hidden"></div>
</template>
