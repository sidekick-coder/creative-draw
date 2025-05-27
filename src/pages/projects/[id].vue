<script setup lang="ts">
// general
const route = useRoute()

const brush = createBrush()

// board
const board = useBoard()
const boardWidth = ref(500)
const boardHeight = ref(500)

const history = createHistory({
    debug: true,
})
const zoom = createZoom()
const pan = createPan()

function setSizes() {
    boardWidth.value = window.innerWidth
    boardHeight.value = window.innerHeight
}

onMounted(() => {
    setSizes()

    window.addEventListener('resize', setSizes)
})

// project
const projectId = computed(() => route.params.id as string)
const project = ref<any>(null)

async function setProject() {
    const db = $database.selected!

    project.value = await db.projects.get(projectId.value)
}

watch(projectId, setProject, { immediate: true })

// layers
const layers = ref<any[]>([])

function setLayers() {
    if (!project.value) return

    layers.value = project.value.layers || []

    if (!layers.value.length) {
        layers.value.push({
            id: 'default',
            data: [],
        })
    }
}

watch(project, setLayers, { immediate: true })

// canvas
const canvasWidth = ref(1920)
const canvasHeight = ref(1080)
const canvasX = ref(0)
const canvasY = ref(0)

function centralize() {
    pan.reset()

    canvasX.value = boardWidth.value / 2 - canvasWidth.value / 2
    canvasY.value = boardHeight.value / 2 - canvasHeight.value / 2
}

function fit() {
    const paddingX = 80
    const paddingY = 80

    const availableWidth = boardWidth.value - paddingX * 2
    const availableHeight = boardHeight.value - paddingY * 2

    const width = canvasWidth.value
    const height = canvasHeight.value

    const scaleWidth = availableWidth / width
    const scaleHeight = availableHeight / height

    const newScale = Math.min(scaleWidth, scaleHeight)

    zoom.scale = newScale
}

function setCanvasSizes() {
    if (!project.value) return

    canvasWidth.value = project.value.width
    canvasHeight.value = project.value.height

    fit()
    centralize()
}

watch(project, setCanvasSizes)
onMounted(setCanvasSizes)

// save
async function save() {
    const db = $database.selected!

    if (!project.value) return

    const layers = board.layers.map((layer) => ({
        id: layer.id,
        data: JSON.parse(JSON.stringify(layer.get('data', []))),
    }))

    await db.projects.update(project.value.id, {
        layers,
    })
}
</script>
<template>
    <div class="relative w-screen h-screen overflow-hidden">
        <div class="fixed top-0 right-0 flex flex-wrap gap-2 bg-body-900 z-20 p-4">
            <cd-btn @click="history.undo">undo</cd-btn>
            <cd-btn @click="history.redo">redo</cd-btn>
            <cd-btn @click="save">save</cd-btn>
            <cd-btn @click="centralize">center</cd-btn>
            <cd-btn @click="fit">fit</cd-btn>
            <cd-text-field v-model="zoom.scale" type="number" label="Zoom" step="0.1" />
        </div>

        <cd-board :width="boardWidth" :height="boardHeight" :plugins="[history, zoom, pan]">
            <cd-board-layer
                v-for="layer in layers"
                :key="layer.id"
                :width="canvasWidth"
                :height="canvasHeight"
                :x="canvasX"
                :y="canvasY"
                :data="layer.data"
                :plugins="[brush]"
            />
        </cd-board>
    </div>
</template>
