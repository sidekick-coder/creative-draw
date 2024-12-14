<script setup lang="ts">
// general
const className = defineProp('class', {
    type: String,
    default: '',
})

const { set, classes } = useClassBuilder({
    class: className,
})

set('base', 'relative transition-colors duration-200 size-40 outline outline-body-500')

// model
const model = defineModel({
    type: Object as PropType<ColorRGB>,
    default: { red: 0, green: 0, blue: 0 },
})

const hue = computed(() => {
    const { h } = rgbToHsl(model.value.r, model.value.g, model.value.b)

    return h
})

// canvas
const size = defineProp<number>('size', {
    type: Number,
    default: 300,
})

const canvas = ref<HTMLCanvasElement>()

function setGradient() {
    if (!canvas.value) return

    const ctx = canvas.value.getContext('2d')!

    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    const gradientH = ctx.createLinearGradient(0, 0, canvas.value.width, 0)

    gradientH.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradientH.addColorStop(1, `hsl(${hue.value * 360}, 100%, 50%)`)

    ctx.fillStyle = gradientH
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)

    const gradientV = ctx.createLinearGradient(0, 0, 0, canvas.value.height)

    gradientV.addColorStop(0, 'rgba(0, 0, 0, 0)')
    gradientV.addColorStop(1, 'rgba(0, 0, 0, 1)')

    ctx.fillStyle = gradientV
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height)
}

watch(hue, setGradient)

onMounted(setGradient)

// pointer
const position = ref({ x: 0, y: 0 })
const dragging = ref(false)

function findColorByPosition(x: number, y: number): ColorRGB {
    if (!canvas.value) return { r: 0, g: 0, b: 0 }

    const ctx = canvas.value.getContext('2d')!

    const pixel = ctx.getImageData(x, y, 1, 1).data

    const [r, g, b] = pixel

    if (!r || !g || !b) return { r: 0, g: 0, b: 0 }

    return { r, g, b }
}

function setPosition() {
    if (!canvas.value || dragging.value) return

    const ctx = canvas.value.getContext('2d')!

    const { data } = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height)

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        if (r === model.value.r && g === model.value.g && b === model.value.b) {
            let pixelX = (i / 4) % canvas.value.width
            let pixelY = Math.floor(i / 4 / canvas.value.width)

            pixelX = Math.max(0, Math.min(pixelX, canvas.value.width - 16))
            pixelY = Math.max(0, Math.min(pixelY, canvas.value.height - 16))

            position.value = { x: pixelX, y: pixelY }

            return
        }
    }
}

function onPointerdown(e: PointerEvent) {
    dragging.value = true

    onPointermove(e)
}

function onPointermove(e: PointerEvent) {
    if (!canvas.value || !dragging.value) return

    const rect = canvas.value.getBoundingClientRect()

    let x = e.clientX - rect.left
    let y = e.clientY - rect.top

    x = Math.max(0, Math.min(x, canvas.value.width - 16))
    y = Math.max(0, Math.min(y, canvas.value.height - 16))

    position.value = { x, y }

    model.value = findColorByPosition(x, y)
}

function onPointerup() {
    dragging.value = false
}

watch(model, setPosition, { deep: true })

onMounted(setPosition)

watch(dragging, () => {
    set('dragging', dragging.value ? 'cursor-none' : '')
})
</script>

<template>
    <div
        :class="classes"
        :style="{
            width: `${size}px`,
            height: `${size}px`,
        }"
        @pointerdown.prevent="onPointerdown"
        @pointermove="onPointermove"
        @pointerup="onPointerup"
        @pointerleave="onPointerup"
    >
        <button
            class="absolute size-4 rounded-full border-2 border-body-0 bg-body-0/25"
            :style="{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }"
        />

        <canvas ref="canvas" :width="size" :height="size" />
    </div>
</template>
