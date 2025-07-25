<script setup lang="ts">
import type { ColorRGB } from '@/utils/colors'

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
    const canvas = getCanvas()

    canvas.style.left = `${x.value}px`
    canvas.style.top = `${y.value}px`
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

// board link
const board = useBoard()

board.addLayer(layer)

// draw
function clear() {
    const ctx = getContext()
    ctx.clearRect(0, 0, width.value, height.value)
}

// paths
const map = new Set<string>()

function createPathKey(x: number, y: number, pressure: number, size: number, color: ColorRGB) {
    return `${Math.round(x)}-${Math.round(y)}-${pressure.toFixed(2)}-${size.toFixed(2)}-${color.r}-${color.g}-${color.b}`
}

function drawPaths(paths: BrushPath[]) {
    const ctx = getContext()

    paths.forEach((p) => {
        const key = createPathKey(p.x, p.y, p.pressure, p.size, p.color)

        if (map.has(key)) {
            return
        }

        map.add(key)

        const opacity = p.opacity || 1

        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = opacity
        ctx.fillStyle = `rgb(${p.color.r}, ${p.color.g}, ${p.color.b})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    })
}

layer.emitter.on('paths:draw', drawPaths)

layer.emitter.on('paths:begin', () => {
    map.clear()
})

layer.emitter.on('paths:end', () => {
    map.clear()
})

function draw() {
    const items = layer.get<any[]>('data', [])

    items.forEach((item) => {
        if (item.type === 'brush') {
            drawPaths(item.paths)
        }
    })
}

function redraw() {
    clear()
    draw()
}

layer.emitter.on('clear', clear)
layer.emitter.on('render', redraw)

layer.emitter.on('draw', draw)

// data
const data = defineProp<any[]>('data', {
    type: Array,
    default: () => [],
})

onMounted(() => {
    layer.set('data', data.value)
    redraw()
})
</script>
<template>
    <canvas ref="root" class="absolute" />
</template>
