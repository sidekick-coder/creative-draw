<script setup lang="ts">
const board = useBoard()

const loading = ref(true)
const container = ref<HTMLElement>()

const height = defineProp<number>('height', {
    type: Number,
    required: true,
})

const width = defineProp<number>('width', {
    type: Number,
    required: true,
})

const size = computed(() => {
    const current = width.value

    return Math.ceil(current * 0.03)
})

function load() {
    loading.value = true

    container.value!.style.width = `${width.value}px`
    container.value!.style.height = `${height.value}px`

    // make x & y center
    container.value!.style.marginLeft = `${width.value / 2}px`
    container.value!.style.marginTop = `${height.value / 2}px`

    loading.value = false
}

watch([width, height], load)

onMounted(load)

// events
function onPointerEvent(e: PointerEvent) {
    // instance.emit(`container:${e.type}`, {
    //     event: e,
    // })
}

function onTouchEvent(e: TouchEvent) {
    // instance.emit(`container:${e.type}`, {
    //     event: e,
    // })
}

function onMouseEvent(e: MouseEvent) {
    // instance.emit(`container:${e.type}`, {
    //     event: e,
    // })
}
</script>
<template>
    <div
        ref="container"
        class="relative"
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
