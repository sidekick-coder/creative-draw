<script setup lang="ts">
const canvas = ref<HTMLCanvasElement>()
let context: CanvasRenderingContext2D

// const state = reactive({
//     offsetX: 0,
//     offsetY: 0,
//     lastX: 0,
//     lastY: 0,
// })
//
// const isDrawing = ref(false)
//
// function onMouseMove(e: MouseEvent) {
//     if (!isDrawing.value) return
//
//     context.lineWidth = 10
//     context.lineCap = 'round'
//     context.lineJoin = 'round'
//
//     context.beginPath()
//
//     context.moveTo(state.lastX, state.lastY)
//     context.lineTo(e.clientX - state.offsetX, e.clientY)
//
//     context.stroke()
//
//     state.lastX = e.clientX - state.offsetX
//     state.lastY = e.clientY
// }

const { start, stop, draw, load: loadBrushes } = useBrush()

function load() {
    if (!canvas.value) return

    const parent = canvas.value.parentElement!

    const offsetX = canvas.value.offsetLeft
    const offsetY = canvas.value.offsetTop

    // state.offsetX = canvas.value.offsetLeft
    // state.offsetY = canvas.value.offsetTop

    canvas.value.width = parent.clientWidth - offsetX
    canvas.value.height = parent.clientHeight - offsetY

    context = canvas.value.getContext('2d')!

    loadBrushes(context)

    canvas.value.addEventListener('mousedown', start)
    canvas.value.addEventListener('mousemove', draw)
    canvas.value.addEventListener('mouseup', stop)

    // context.strokeStyle = '#000000'

    // canvas.value.addEventListener('mousedown', (e) => {
    //     isDrawing.value = true
    //     state.lastX = e.offsetX
    //     state.lastY = e.offsetY
    // })
    //
    // canvas.value.addEventListener('mouseup', () => {
    //     isDrawing.value = false
    // })
    //
    // canvas.value.addEventListener('mousemove', onMouseMove)
}

onMounted(load)
</script>

<template>
    <canvas ref="canvas" class="bg-white" />
</template>
