<script setup lang="ts">
const instance = useInstance()

const model = defineModel({
    type: Object as PropType<Layer>,
    default: () => ({
        id: createId(),
        name: 'Paint',
        order: 2,
        type: 'paint',
        width: 1920,
        height: 1080,
        data: new Uint8Array(1920 * 1080 * 4),
    }),
})

const scale = computed(() => instance.scale)

// render
const canvas = ref<HTMLCanvasElement>()
const offscreen = ref<OffscreenCanvas>()
const interval = ref<NodeJS.Timeout>()

function render(c: HTMLCanvasElement, offCanvas: OffscreenCanvas) {
    const ctx = c.getContext('2d')!

    c.width = model.value.width * scale.value
    c.height = model.value.height * scale.value

    ctx.clearRect(0, 0, c.width, c.height)

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
        offCanvas,
        0,
        0,
        offCanvas.width,
        offCanvas.height,
        0,
        0,
        offCanvas.width * scale.value,
        offCanvas.height * scale.value
    )
}

function load() {
    if (!canvas.value) return

    offscreen.value = new OffscreenCanvas(model.value.width, model.value.height)

    canvas.value.width = model.value.width
    canvas.value.height = model.value.height

    interval.value = setInterval(() => render(canvas.value!, offscreen.value!), 16)
}

onMounted(load)

onUnmounted(() => {
    if (interval.value) clearInterval(interval.value)
})

// load

function loadData() {
    if (!model.value || !offscreen.value) return

    const ctx = offscreen.value.getContext('2d')!

    const { width, height, data } = model.value

    const imageData = new ImageData(new Uint8ClampedArray(data), width, height)

    ctx.putImageData(imageData, 0, 0)

    // test
    ctx.beginPath()
    ctx.fillStyle = 'red'
    ctx.rect(width / 2 - 50, height / 2 - 50, 100, 100)
    ctx.fill()
    ctx.closePath()
}

onMounted(loadData)
</script>

<template>
    <canvas ref="canvas" class="absolute left-0 top-0 border border-red-500" />
</template>
