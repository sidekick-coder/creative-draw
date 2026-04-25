<script setup lang="ts">
import type { LayerObject } from '@/composables/createLayer'
import type { BrushPath } from '@/composables/defineBrush'
import type { ColorRGB } from '@/utils/colors'

// general
const rootRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
const previewRef = ref<HTMLCanvasElement>()
const layer = defineModel('layer', {
    type: Object as () => Layer,
    required: true,
})

function getCanvas() {
    const canvas = canvasRef.value

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
    if (!rootRef.value) return

    rootRef.value.style.left = `${x.value}px`
    rootRef.value.style.top = `${y.value}px`
}

watch([x, y], setPosition)
onMounted(setPosition)

// bg
function setColor() {
    if (!canvasRef.value) return

    if (!layer.value.backgroundColor) {
        canvasRef.value.style.backgroundColor = 'transparent'
        return
    }

    const color = layer.value.backgroundColor

    canvasRef.value.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`
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
    if (!rootRef.value) return

    rootRef.value.style.width = `${width.value}px`
    rootRef.value.style.height = `${height.value}px`
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
    e.preventDefault() // prevent mouse event emulation

    const ctx = getContext()
    const canvas = getCanvas()

    const rect = canvas.getBoundingClientRect()

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
    canvas.addEventListener('pointercancel', onPointerEvent)
    canvas.addEventListener('pointerout', onPointerEvent)
    canvas.addEventListener('pointerleave', onPointerEvent)
    canvas.addEventListener('lostpointercapture', onPointerEvent)

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
    return `${p.x}-${p.y}-${p.size.toFixed(2)}-${p.color.r}-${p.color.g}-${p.color.b}`
}

function drawPaths(paths: BrushPath[]) {
    const ctx = previewRef.value?.getContext('2d')

    if (!ctx) return

    paths.forEach((p) => {
        const key = createPathKey(p)

        if (map.has(key)) {
            return
        }

        map.add(key)

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

        ctx.fillStyle = `rgb(${p.color.r}, ${p.color.g}, ${p.color.b})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    })
}

function begin(options?: any) {
    const opacity = options?.opacity || 1

    if (!previewRef.value) return

    previewRef.value.style.opacity = String(opacity)

    map.clear()
}

function end() {
    if (!previewRef.value) return

    const ctx = previewRef.value.getContext('2d')

    map.clear()

    ctx?.clearRect(0, 0, previewRef.value.width, previewRef.value.height)
}

function stroke(item: LayerObject) {
    const ctx = getContext()
    const offscreen = new OffscreenCanvas(width.value, height.value)
    const offCtx = offscreen.getContext('2d')!

    offCtx.clearRect(0, 0, offscreen.width, offscreen.height)

    item.paths.forEach((p: BrushPath) => {
        offCtx.globalCompositeOperation = 'source-over'
        offCtx.fillStyle = `rgb(${p.color.r}, ${p.color.g}, ${p.color.b})`
        offCtx.beginPath()
        offCtx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
        offCtx.fill()
        offCtx.closePath()
    })

    const opacity = item.opacity || 1
    ctx.globalAlpha = opacity
    ctx.drawImage(offscreen, 0, 0)
    ctx.globalAlpha = 1
}

layer.value.emitter.on('paths:draw', drawPaths)
layer.value.emitter.on('paths:begin', begin)
layer.value.emitter.on('paths:end', end)
layer.value.emitter.on('stroke', stroke)

function clear() {
    const ctx = getContext()
    map.clear()
    ctx.clearRect(0, 0, width.value, height.value)
}

function draw() {
    const items = layer.value.get<LayerObject[]>('data', [])

    items.forEach((item) => {
        stroke(item)
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
    <div
        ref="rootRef"
        class="absolute"
        :class="{
            'opacity-0': !layer.visible,
        }"
    >
        <canvas
            ref="previewRef"
            :width
            :height
            class="size-full absolute inset-0 pointer-events-none"
        />
        <canvas ref="canvasRef" :width :height class="size-full" />
    </div>
</template>
