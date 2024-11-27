<script setup lang="ts">
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

const width = defineProp<number>('width', {
    type: Number,
    required: true,
})

const height = defineProp<number>('height', {
    type: Number,
    required: true,
})

const canvas = ref<HTMLCanvasElement>()
const offscreenCanvas = new OffscreenCanvas(width.value, height.value)
const offscreenContext = offscreenCanvas.getContext('2d')!

let context: CanvasRenderingContext2D

const { start, stop, draw } = useBrush({
    brushes,
    selected: brushSelected,
    settings: brushSettings,
})

function load() {
    if (!canvas.value) return

    context = canvas.value.getContext('2d')!

    // draw square
    context.fillStyle = 'black'
    context.fillRect(width.value / 2 - 50, height.value / 2 - 50, 100, 100)

    offscreenContext.fillStyle = 'black'
    offscreenContext.fillRect(width.value / 2 - 50, height.value / 2 - 50, 100, 100)

    canvas.value.addEventListener('touchstart', (event) => {
        event.preventDefault()
        event.stopPropagation()
    })

    canvas.value.addEventListener('touchmove', (event) => {
        event.preventDefault()
        event.stopPropagation()
    })

    canvas.value.addEventListener('touchend', (event) => {
        event.preventDefault()
        event.stopPropagation()
    })

    canvas.value.addEventListener('pointerdown', (event) => {
        event.preventDefault()
        start({ event, ctx: context })
        start({ event, ctx: offscreenContext })
    })

    canvas.value.addEventListener('pointermove', (event) => {
        event.preventDefault()
        draw({ event, ctx: context })
        draw({ event, ctx: offscreenContext })
    })

    canvas.value.addEventListener('pointerup', (event) => {
        stop({ event, ctx: context })
        stop({ event, ctx: offscreenContext })
    })
}

onMounted(load)

// scale
const scale = defineProp<number>('scale', {
    type: Number,
    default: 1,
})

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

    context.clearRect(0, 0, canvas.value.width, canvas.value.height)

    canvas.value.width = width.value * scale.value
    canvas.value.height = height.value * scale.value

    context.scale(scale.value, scale.value)

    context.imageSmoothingEnabled = false
    context.imageSmoothingQuality = 'high'

    context.drawImage(offscreenCanvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height)
    context.restore()
}

onMounted(rescale)
watch([scale, offsetX, offsetY], rescale)

// save

function toDataURL(type: string = 'image/png', quality: number = 1) {
    return canvas.value!.toDataURL(type, quality)
}

function toBlob() {
    return new Promise<Blob>((resolve) => {
        canvas.value!.toBlob((blob) => {
            resolve(blob!)
        })
    })
}

defineExpose({
    toDataURL,
    toBlob,
})
</script>

<template>
    <canvas ref="canvas" class="bg-white" :width :height />
</template>
