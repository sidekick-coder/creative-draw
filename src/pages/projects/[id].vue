<script setup lang="ts">
// general
const brush = createBrush()
const history = createHistory()
const zoom = createZoom()
const pan = createPan()

onMounted(() => {
    setTimeout(() => history.commit('Board ready'), 1000)
})

// board
const boardWidth = ref(500)
const boardHeight = ref(500)

function setSizes() {
    boardWidth.value = window.innerWidth
    boardHeight.value = window.innerHeight
}

onMounted(() => {
    setSizes()

    window.addEventListener('resize', setSizes)
})

// canvas
const canvasWidth = ref(1920)
const canvasHeight = ref(1080)
const canvasX = ref(0)
const canvasY = ref(0)

function setCanvasSizes() {
    canvasWidth.value = 1920
    canvasHeight.value = 1080
}

function centerCanvas() {
    const scale = zoom.scale
    canvasX.value = (boardWidth.value / 2) * -1 * scale
    canvasY.value = (boardHeight.value / 2) * -1 * scale
}

watch([boardWidth, boardHeight, () => zoom.scale], setCanvasSizes)

// other
const layer = useLayer()

function clear() {
    layer.emitter.emit('clear')
}

function redraw() {
    layer.emitter.emit('render')
}

function save() {
    const data = layer.get<any[]>('data', [])

    console.log('Saved data:', data)
}
</script>
<template>
    <div class="relative w-screen h-screen overflow-hidden">
        <div class="fixed top-0 right-0 flex flex-wrap gap-2 bg-body-900 z-20 p-4">
            <cd-btn @click="history.undo">undo</cd-btn>
            <cd-btn @click="history.redo">redo</cd-btn>
            <cd-btn @click="clear">clear</cd-btn>
            <cd-btn @click="redraw">redraw</cd-btn>
            <cd-btn @click="save">save</cd-btn>
            <cd-btn @click="centerCanvas">center</cd-btn>
            <cd-text-field v-model="zoom.scale" type="number" label="Zoom" step="0.1" />
        </div>

        <cd-board :width="boardWidth" :height="boardHeight" :plugins="[history, zoom, pan]">
            <cd-board-layer
                :width="canvasWidth"
                :height="canvasHeight"
                :x="canvasX"
                :y="canvasY"
                :plugins="[brush]"
            />
        </cd-board>
    </div>
</template>
