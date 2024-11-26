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

let context: CanvasRenderingContext2D

const { start, stop, draw } = useBrush({
    brushes,
    selected: brushSelected,
    settings: brushSettings,
})

function load() {
    if (!canvas.value) return

    context = canvas.value.getContext('2d')!

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
        start({ event, ctx: context })
    })

    canvas.value.addEventListener('pointermove', (event) => {
        draw({ event, ctx: context })
    })

    canvas.value.addEventListener('pointerup', (event) => {
        stop({ event, ctx: context })
    })
}

onMounted(load)

// save

function save() {
    const image = canvas.value!.toDataURL('image/png')

    return image
}

function toBlob() {
    return new Promise<Blob>((resolve) => {
        canvas.value!.toBlob((blob) => {
            resolve(blob!)
        })
    })
}

defineExpose({
    save,
    toBlob,
})
</script>

<template>
    <canvas ref="canvas" class="bg-white" :width :height />
</template>
