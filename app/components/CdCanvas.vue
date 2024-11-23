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

const canvas = ref<HTMLCanvasElement>()

let context: CanvasRenderingContext2D

const { start, stop, draw } = useBrush({
    brushes,
    selected: brushSelected,
    settings: brushSettings,
})

function onResize() {
    if (!canvas.value) return

    const parent = canvas.value.parentElement!

    canvas.value.width = parent.clientWidth
    canvas.value.height = parent.clientHeight
}

function load() {
    if (!canvas.value) return

    onResize()

    new ResizeObserver(onResize).observe(canvas.value.parentElement!)

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
</script>

<template>
    <canvas ref="canvas" class="size-full bg-white" />
</template>
