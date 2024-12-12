<script setup lang="ts">
import type { Layer } from '@/composables/useInstance'

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
        data: new OffscreenCanvas(1920, 1080),
    }),
})

const scale = computed(() => instance.tools.zoomAndPan.scale)

// render
const canvas = ref<HTMLCanvasElement>()
const interval = ref<NodeJS.Timeout>()

function render(c: HTMLCanvasElement) {
    const ctx = c.getContext('2d')!

    c.width = model.value.width * scale.value
    c.height = model.value.height * scale.value

    ctx.clearRect(0, 0, c.width, c.height)

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    ctx.drawImage(
        model.value.data,
        0,
        0,
        model.value.data.width,
        model.value.data.height,
        0,
        0,
        model.value.data.width * scale.value,
        model.value.data.height * scale.value
    )
}

function load() {
    if (!canvas.value) return

    canvas.value.width = model.value.width
    canvas.value.height = model.value.height

    interval.value = setInterval(() => render(canvas.value!), 16)
}

onMounted(load)

onUnmounted(() => {
    if (interval.value) clearInterval(interval.value)
})

// events
function onPointerDown(e: PointerEvent) {
    const ctx = model.value.data.getContext('2d')!

    instance.emit('layer:pointerdown', {
        event: e,
        ctx,
        x: e.offsetX / scale.value,
        y: e.offsetY / scale.value,
        pressure: e.pressure,
    })
}

function onPointerMove(e: PointerEvent) {
    const ctx = model.value.data.getContext('2d')!

    instance.emit('layer:pointermove', {
        event: e,
        ctx,
        x: e.offsetX / scale.value,
        y: e.offsetY / scale.value,
        pressure: e.pressure,
    })
}

function onPointerUp(e: PointerEvent) {
    const ctx = model.value.data.getContext('2d')!

    instance.emit('layer:pointerup', {
        event: e,
        ctx,
        x: e.offsetX / scale.value,
        y: e.offsetY / scale.value,
        pressure: e.pressure,
    })
}
</script>

<template>
    <canvas
        ref="canvas"
        class="absolute left-0 top-0"
        @pointerdown="onPointerDown"
        @touchmove.prevent
        @pointerdown.prevent="onPointerDown"
        @pointermove.prevent="onPointerMove"
        @pointerup.prevent="onPointerUp"
        @pointerleave.prevent="onPointerUp"
    />
</template>
