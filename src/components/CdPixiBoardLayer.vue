<script setup lang="ts">
import { Application, Graphics, Container } from 'pixi.js'
import type { LayerObject } from '@/composables/createLayer'
import type { BrushPath } from '@/composables/defineBrush'
import type { ColorRGB } from '@/utils/colors'
import { until } from '@vueuse/core'

// general
const root = ref<HTMLCanvasElement | null>(null)
const layer = defineModel('layer', {
    type: Object as () => Layer,
    required: true,
})
const loaded = ref(false)
let app: Application | null = null
let layerContainer: Container | null = null

function getLayerContainer() {
    if (!layerContainer) {
        throw new Error('Failed to get layer container')
    }

    return layerContainer
}

onMounted(async () => {
    if (!root.value) {
        throw new Error('Failed to get canvas element')
    }

    // Initialize PixiJS application
    app = new Application()

    await app.init({
        canvas: root.value,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        width: root.value.width,
        height: root.value.height,
    })

    // Create layer container
    layerContainer = new Container()
    app.stage.addChild(layerContainer)

    // Set references for backward compatibility
    layer.value.set('canvas', root.value)
    layer.value.set('app', app)
    layer.value.set('container', layerContainer)

    loaded.value = true
})

onUnmounted(() => {
    if (app) {
        app.destroy()
        app = null
        layerContainer = null
    }
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

// bg
function setColor() {
    if (!root.value || !app) return

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

async function setSize() {
    if (!app?.renderer) {
        await until(loaded).toBeTruthy()
    }

    if (!app?.renderer) return

    app?.renderer.resize(width.value, height.value)
}

watch([width, height], setSize)
onMounted(setSize)

// events
function onPointerEvent(e: PointerEvent) {
    const rect = root.value!.getBoundingClientRect()

    const localX = (e.clientX - rect.left) * (width.value / rect.width)
    const localY = (e.clientY - rect.top) * (height.value / rect.height)

    layer.value.emitter.emit(e.type, {
        event: e,
        ctx: null, // PixiJS doesn't use 2D context
        x: localX,
        y: localY,
        pressure: e.pressure,
    })
}

function onTouchEvent(e: TouchEvent) {
    const rect = root.value!.getBoundingClientRect()

    const touch = e.touches[0]

    let localX = 0
    let localY = 0
    let force = 0

    if (touch) {
        localX = (touch.clientX - rect.left) * (width.value / rect.width)
        localY = (touch.clientY - rect.top) * (height.value / rect.height)
        force = touch.force
    }

    layer.value.emitter.emit(e.type, {
        event: e,
        ctx: null, // PixiJS doesn't use 2D context
        x: localX,
        y: localY,
        pressure: force,
    })
}

function onMouseEvent(e: MouseEvent) {
    const rect = root.value!.getBoundingClientRect()

    const localX = (e.clientX - rect.left) * (width.value / rect.width)
    const localY = (e.clientY - rect.top) * (height.value / rect.height)

    layer.value.emitter.emit(e.type, {
        event: e,
        ctx: null, // PixiJS doesn't use 2D context
        x: localX,
        y: localY,
    })
}

onMounted(() => {
    if (!root.value) return

    const canvas = root.value

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
const pathGraphicsMap = new Map<string, Graphics>()

function createPathKey(p: BrushPath) {
    return `${p.x}-${p.y}-${p.opacity.toFixed(2)}-${p.size.toFixed(2)}-${p.color.r}-${p.color.g}-${p.color.b}`
}

function rgbToHex(color: ColorRGB): number {
    return (color.r << 16) | (color.g << 8) | color.b
}

function drawPaths(paths: BrushPath[]) {
    const container = getLayerContainer()

    paths.forEach((p) => {
        // const key = createPathKey(p)

        // if (pathGraphicsMap.has(key)) {
        //     return
        // }

        const graphics = new Graphics()
        // pathGraphicsMap.set(key, graphics)

        const opacity = Math.max(p.opacity || 1, 0.05)
        const hexColor = rgbToHex(p.color)

        if (p.erase) {
            // For erasing, we'll use a different blend mode
            graphics.blendMode = 'erase'
            graphics.circle(p.x, p.y, p.size / 2)
            graphics.fill({ color: 0xffffff, alpha: 1 })
        } else {
            graphics.circle(p.x, p.y, p.size / 2)
            graphics.fill({ color: hexColor, alpha: opacity })
        }

        container.addChild(graphics)
    })
}

function begin() {
    // Clear the path graphics map for new stroke
    pathGraphicsMap.clear()
}

function end() {
    // Keep graphics for stroke completion
}

layer.value.emitter.on('paths:draw', drawPaths)
layer.value.emitter.on('paths:begin', begin)
layer.value.emitter.on('paths:end', end)

function clear() {
    const container = getLayerContainer()

    // Remove all child graphics
    container.removeChildren()
    pathGraphicsMap.clear()
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
onMounted(async () => {
    await until(loaded).toBeTruthy()

    nextTick(() => {
        draw()
    })
})
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
