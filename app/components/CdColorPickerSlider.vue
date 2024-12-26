<script setup lang="ts">
// general
const className = defineProp('class', {
    type: String,
    default: '',
})

const { set, classes } = useClassBuilder({
    class: className,
})

set('base', 'relative transition-colors duration-200 outline outline-body-500')

// model (hue)
const model = defineModel({
    type: Number,
    default: 0,
})

// canvas
const width = defineProp<number>('width', {
    type: Number,
    default: 26,
})

const height = defineProp<number>('height', {
    type: Number,
    default: 300,
})

const canvas = ref<HTMLCanvasElement>()

function setGradient() {
    if (!canvas.value) return

    const ctx = canvas.value.getContext('2d')!

    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.value.height)

    for (let i = 0; i <= 360; i++) {
        gradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`)
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
}

onMounted(setGradient)

// pointer
const position = ref({ x: 0, y: 0 })
const dragging = ref(false)

function onPointerdown(e: PointerEvent) {
    dragging.value = true

    onPointermove(e)
}

function onPointermove(e: PointerEvent) {
    if (!canvas.value || !dragging.value) return

    const rect = canvas.value.getBoundingClientRect()

    let x = 0
    let y = e.clientY - rect.top

    y = Math.max(0, Math.min(y, canvas.value.height - 16))

    position.value = { x, y }
    model.value = position.value.y / height.value
}

function onPointerup() {
    dragging.value = false
}

watch(
    model,
    () => {
        if (dragging.value) return

        position.value = { x: 0, y: model.value * height.value }
    },
    { immediate: true }
)

watch(dragging, () => {
    set('dragging', dragging.value ? 'cursor-none' : '')
})
</script>

<template>
    <div
        :class="classes"
        :style="{
            width: `${width}px`,
            height: `${height}px`,
        }"
        @touchmove.prevent
        @touchstart.prevent
        @pointerdown="onPointerdown"
        @pointermove="onPointermove"
        @pointerup="onPointerup"
        @pointerleave="onPointerup"
    >
        <button
            class="absolute h-4 w-full border-2 border-body-0 bg-body-0/25"
            :style="{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }"
        />

        <canvas ref="canvas" :width :height />
    </div>
</template>
