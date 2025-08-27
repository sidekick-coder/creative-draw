<script setup lang="ts">
import type { LayerObject } from '@/composables/createLayer'
import type { BrushPath } from '@/composables/defineBrush'
import type { ColorRGB } from '@/utils/colors'

// general
const root = ref<HTMLCanvasElement | null>(null)
const layer = defineModel('layer', {
    type: Object as () => Layer,
    required: true,
})

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
    layer.value.set('canvas', getCanvas())
    layer.value.set('context', getContext())
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

// bg
function setColor() {
    if (!root.value) return

    if (!layer.value.backgroundColor) {
        root.value.style.backgroundColor = 'transparent'
        return
    }

    const color = layer.value.backgroundColor

    root.value.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`
}

watch(() => layer.value.backgroundColor, setColor)

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

    layer.value.emitter.emit(e.type, {
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

    layer.value.emitter.emit(e.type, {
        event: e,
        ctx,
        x,
        y,
        pressure: force,
    })
}

function onMouseEvent(e: MouseEvent) {
    const ctx = getContext()

    layer.value.emitter.emit(e.type, {
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

// paths
const map = new Set<string>()

function createPathKey(p: BrushPath) {
    return `${p.x}-${p.y}-${p.opacity.toFixed(2)}-${p.size.toFixed(2)}-${p.color.r}-${p.color.g}-${p.color.b}`
}

function drawPaths(paths: BrushPath[]) {
    const ctx = getContext()

    paths.forEach((p) => {
        const key = createPathKey(p)

        if (map.has(key)) {
            return
        }

        map.add(key)

        const opacity = Math.max(p.opacity || 1, 0.05)

        if (p.erase) {
            ctx.globalCompositeOperation = 'destination-out'
            ctx.fillStyle = `rgb(${p.color.r}, ${p.color.g}, ${p.color.b})`
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
            ctx.fill()
            ctx.closePath()
            ctx.globalCompositeOperation = 'source-over'
            return
        }

        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${opacity})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    })
}

function begin() {
    map.clear()
}

function end() {
    map.clear()
}

layer.value.emitter.on('paths:draw', drawPaths)
layer.value.emitter.on('paths:begin', begin)
layer.value.emitter.on('paths:end', end)

function clear() {
    const ctx = getContext()
    ctx.clearRect(0, 0, width.value, height.value)
    map.clear()
}

function draw() {
    const items = layer.value.get<LayerObject[]>('data', [])

    items.forEach((item) => {
        begin()

        if (item.type === 'stroke') {
            drawPaths(item.paths)
        }

        end()
    })
}

function redraw() {
    clear()
    draw()
}

layer.value.emitter.on('clear', clear)
layer.value.emitter.on('redraw', redraw)
layer.value.emitter.on('render', redraw)
layer.value.emitter.on('draw', draw)

// data
onMounted(draw)
</script>
<template>
    <canvas
        ref="root"
        class="absolute"
        :class="{
            'opacity-0': !layer.visible,
        }"
    />
</template>
