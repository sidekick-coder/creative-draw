<script setup lang="ts">
// general
const root = ref<HTMLCanvasElement | null>(null)
const layer = useLayer()

function getCanvas() {
    const canvas = root.value

    if (!canvas) {
        throw new Error('Failed to get canvas')
    }

    return canvas
}

function getContext() {
    const canvas = getCanvas()

    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('Failed to get canvas context')
    }

    return ctx
}

onMounted(() => {
    layer.set('canvas', getCanvas())
    layer.set('context', getContext())
})

// position
const x = defineProp<number>('x', {
    type: Number,
    default: 0,
})

const y = defineProp<number>('y', {
    type: Number,
    default: 0,
})

function setPosition() {
    if (!root.value) return

    root.value.style.left = `${x.value}px`
    root.value.style.top = `${y.value}px`
}

watch([x, y], setPosition)
onMounted(setPosition)

// color
const backgroundColor = defineProp<string>('backgroundColor', {
    type: String,
    default: '#ffffff',
})

function setColor() {
    if (!root.value) return

    root.value.style.backgroundColor = backgroundColor.value
}

watch(backgroundColor, setColor)

onMounted(setColor)

// sizes
const width = defineProp<number>('width', {
    type: Number,
    default: 0,
})

const height = defineProp<number>('height', {
    type: Number,
    default: 0,
})

function setSize() {
    if (!root.value) return

    root.value.width = width.value
    root.value.height = height.value
}

watch([width, height], setSize)

onMounted(setSize)

// events
function onPointerEvent(e: PointerEvent) {
    const ctx = getContext()

    layer.emitter.emit(e.type, {
        event: e,
        ctx,
        x: e.offsetX,
        y: e.offsetY,
        pressure: e.pressure,
    })
}

function onTouchEvent(e: TouchEvent) {
    const ctx = getContext()
    const canvas = getCanvas()

    const rect = root.value!.getBoundingClientRect()

    const touch = e.touches[0]

    let x = 0
    let y = 0
    let force = 0

    if (touch) {
        x = (touch.clientX - rect.x) * (canvas.width / rect.width)
        y = (touch.clientY - rect.y) * (canvas.height / rect.height)
        force = touch.force
    }

    layer.emitter.emit(e.type, {
        event: e,
        ctx,
        x,
        y,
        pressure: force,
    })
}

function onMouseEvent(e: MouseEvent) {
    const ctx = getContext()

    layer.emitter.emit(e.type, {
        event: e,
        ctx,
        x: e.offsetX,
        y: e.offsetY,
    })
}

onMounted(() => {
    const canvas = getCanvas()

    canvas.addEventListener('pointerdown', onPointerEvent)
    canvas.addEventListener('pointerup', onPointerEvent)
    canvas.addEventListener('pointermove', onPointerEvent)

    canvas.addEventListener('touchstart', onTouchEvent, { passive: false })
    canvas.addEventListener('touchend', onTouchEvent, { passive: false })
    canvas.addEventListener('touchmove', onTouchEvent, { passive: false })

    canvas.addEventListener('mousedown', onMouseEvent)
    canvas.addEventListener('mouseup', onMouseEvent)
    canvas.addEventListener('mousemove', onMouseEvent)
})

// plugins
const plugins = defineProp<LayerPlugin[]>('plugins', {
    type: Array,
    default: () => [],
})

onMounted(() => {
    for (const plugin of plugins.value) {
        plugin.install(layer)
    }
})

// board link
const board = useBoard()

board.addLayer(layer)
</script>
<template>
    <canvas ref="root" class="absolute" />
</template>
