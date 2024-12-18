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
function onPointerEvent(e: PointerEvent, type: 'down' | 'move' | 'up') {
    const ctx = model.value.data.getContext('2d')!

    instance.emit(`layer:pointer${type}`, {
        event: e,
        ctx,
        x: e.offsetX / scale.value,
        y: e.offsetY / scale.value,
        pressure: e.pressure,
    })
}

function onTouchEvent(e: TouchEvent, type: 'start' | 'move' | 'end') {
    const ctx = model.value.data.getContext('2d')!

    const rect = canvas.value!.getBoundingClientRect()

    const touch = e.touches[0]

    if (!touch) return

    instance.emit(`layer:touch${type}`, {
        event: e,
        ctx,
        x: (touch.clientX - rect.left) / scale.value,
        y: (touch.clientY - rect.top) / scale.value,
        pressure: touch.force,
    })
}

function onMouseEvent(e: MouseEvent, type: 'down' | 'move' | 'up') {
    const ctx = model.value.data.getContext('2d')!

    instance.emit(`layer:mouse${type}`, {
        event: e,
        ctx,
        x: e.offsetX / scale.value,
        y: e.offsetY / scale.value,
    })
}
</script>

<template>
    <canvas
        ref="canvas"
        class="absolute left-0 top-0"
        @mousedown.prevent="onMouseEvent($event, 'down')"
        @mousemove.prevent="onMouseEvent($event, 'move')"
        @mouseup.prevent="onMouseEvent($event, 'up')"
        @touchstart.prevent="onTouchEvent($event, 'start')"
        @touchmove.prevent="onTouchEvent($event, 'move')"
        @touchend.prevent="onTouchEvent($event, 'end')"
        @pointerdown="onPointerEvent($event, 'down')"
        @pointermove.prevent="onPointerEvent($event, 'move')"
        @pointerup.prevent="onPointerEvent($event, 'up')"
        @pointerleave.prevent="onPointerEvent($event, 'up')"
    />
</template>
