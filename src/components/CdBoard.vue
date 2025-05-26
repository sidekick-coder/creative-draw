<script setup lang="ts">
// general
const board = useBoard()

const loading = ref(true)
const container = ref<HTMLElement>()

// size
const height = defineProp<number>('height', {
    type: Number,
    required: true,
})

const width = defineProp<number>('width', {
    type: Number,
    required: true,
})

function load() {
    loading.value = true

    container.value!.style.width = `${width.value}px`
    container.value!.style.height = `${height.value}px`

    // make x & y center
    // container.value!.style.marginLeft = `${width.value / 2}px`
    // container.value!.style.marginTop = `${height.value / 2}px`

    board.context.set('container', container.value!)

    loading.value = false
}

watch([width, height], load)

onMounted(load)

// plugins
const plugins = defineProp<BoardPlugin[]>('plugins', {
    type: Array,
    default: () => [],
})

onMounted(() => {
    for (const plugin of plugins.value) {
        plugin.install(board)
    }

    board.emitter.emit('ready')
})

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
