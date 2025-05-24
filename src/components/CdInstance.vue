<script setup lang="ts">
const loading = ref(true)
const container = ref<HTMLElement>()
const instance = useInstance()

const height = defineProp<number>('height', {
    type: Number,
    required: true,
})

const width = defineProp<number>('width', {
    type: Number,
    required: true,
})

const size = computed(() => {
    const current = width.value * instance.tools.zoomAndPan.scale

    return Math.ceil(current * 0.03)
})

function load() {
    loading.value = true

    if (container.value) {
        instance.load(container.value!, width.value, height.value)
    }

    nextTick(() => {
        instance.tools.zoomAndPan.fit()
    })

    loading.value = false
}

watch([width, height], load)

onMounted(load)

// events
function onPointerEvent(e: PointerEvent) {
    instance.emit(`container:${e.type}`, {
        event: e,
    })
}

function onTouchEvent(e: TouchEvent) {
    instance.emit(`container:${e.type}`, {
        event: e,
    })
}

function onMouseEvent(e: MouseEvent) {
    instance.emit(`container:${e.type}`, {
        event: e,
    })
}
</script>
<template>
    <div
        ref="container"
        class="relative overflow-hidden"
        :style="{
            'background-size': `${size}px ${size}px`,
            'background-image': `
                linear-gradient(to right, rgb(var(--color-body-500)) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(var(--color-body-500)) 1px, transparent 1px)

            `,
        }"
        @mousedown="onMouseEvent"
        @mousemove="onMouseEvent"
        @mouseup="onMouseEvent"
        @touchstart="onTouchEvent"
        @touchmove="onTouchEvent"
        @touchend="onTouchEvent"
        @touchcancel="onTouchEvent"
        @pointerdown="onPointerEvent"
        @pointermove="onPointerEvent"
        @pointerup="onPointerEvent"
        @pointerleave="onPointerEvent"
    >
        <slot v-if="!loading" />
    </div>
</template>
