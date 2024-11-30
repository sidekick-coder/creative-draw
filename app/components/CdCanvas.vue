<script setup lang="ts">
// canvas
const width = defineProp<number>('width', {
    type: Number,
    required: true,
})

const height = defineProp<number>('height', {
    type: Number,
    required: true,
})

const scale = defineProp<number>('scale', {
    type: Number,
    default: 1,
})

const canvas = ref<HTMLCanvasElement>()
const offscreenCanvas = document.createElement('canvas')

offscreenCanvas.width = width.value
offscreenCanvas.height = height.value

const offscreenContext = offscreenCanvas.getContext('2d')!

function render(c: HTMLCanvasElement) {
    const ctx = c.getContext('2d')!

    c.width = width.value * scale.value
    c.height = height.value * scale.value

    ctx.clearRect(0, 0, c.width, c.height)

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
        offscreenCanvas,
        0,
        0,
        offscreenCanvas.width,
        offscreenCanvas.height,
        0,
        0,
        offscreenCanvas.width * scale.value,
        offscreenCanvas.height * scale.value
    )

    requestAnimationFrame(() => render(c))
}

onLoad(canvas, render)

// scale

const offsetX = defineProp<number>('offsetX', {
    type: Number,
    default: 0,
})

const offsetY = defineProp<number>('offsetY', {
    type: Number,
    default: 0,
})

function rescale() {
    if (!canvas.value) return

    const ctx = canvas.value.getContext('2d')!

    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    canvas.value.width = width.value * scale.value
    canvas.value.height = height.value * scale.value
}

onMounted(rescale)
watch([scale, offsetX, offsetY], rescale)

// brush
const brushes = defineModel('brushes', {
    type: Array as PropType<Brush[]>,
    default: null,
})

const brushSelected = defineModel('brushSelected', {
    type: String,
    default: null,
})

const brushSettings = defineModel('brushSettings', {
    type: Object as PropType<BrushSettings>,
    required: true,
})

const { draw, start, stop } = useBrush({
    brushes,
    selected: brushSelected,
    settings: brushSettings,
})

function onPointerDown(event: PointerEvent) {
    if (!canvas.value) return

    // focus the canvas
    canvas.value.focus()

    event.preventDefault()

    const ctx = offscreenContext

    const x = event.offsetX / scale.value
    const y = event.offsetY / scale.value

    start({
        event,
        ctx,
        x,
        y,
    })
}

function onPointerMove(event: PointerEvent) {
    if (!canvas.value) return

    event.preventDefault()

    const ctx = offscreenContext

    const x = event.offsetX / scale.value
    const y = event.offsetY / scale.value

    draw({ event, ctx, x, y })
}

function onPointerUp(event: PointerEvent) {
    if (!canvas.value) return

    event.preventDefault()

    const ctx = offscreenContext

    const x = event.offsetX / scale.value
    const y = event.offsetY / scale.value

    stop({ event, ctx, x, y })
}

onLoad(canvas, (c) => {
    c.addEventListener('touchmove', (event) => {
        event.preventDefault()
    })

    c.addEventListener('pointerdown', onPointerDown)
    c.addEventListener('pointermove', onPointerMove)
    c.addEventListener('pointerup', onPointerUp)
})

// save

let interval: NodeJS.Timeout

const model = defineModel({
    type: Object as PropType<Uint8Array>,
    required: true,
})

function loadModel() {
    if (!model.value) return

    const ctx = offscreenContext

    const imageData = new ImageData(new Uint8ClampedArray(model.value), width.value, height.value)

    ctx.putImageData(imageData, 0, 0)
}

function saveModel() {
    if (!offscreenCanvas) return

    const ctx = offscreenCanvas.getContext('2d')!

    const imageData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height)

    const clampedArray = imageData.data

    model.value = new Uint8Array(clampedArray)
}

onMounted(() => {
    loadModel()

    interval = setInterval(saveModel, 5000)
})

onUnmounted(() => {
    if (interval) clearInterval(interval)
})
</script>

<template>
    <canvas
        ref="canvas"
        class="cursor-crosshair border-2 border-transparent focus:border-primary-300 focus:outline-none"
        :width
        :height
        tabindex="0"
    />
</template>
