<script setup lang="ts">
import { createTransform } from '@/composables/createTransform'

// general
const route = useRoute()

// board
const board = useBoard()
const boardWidth = ref(500)
const boardHeight = ref(500)

const history = createHistory()
const pan = createPan()
const transform = createTransform()
const zoom = createZoom(transform)
const rotate = createRotate(transform)

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

function focus() {
    const container = board.context.get('container')

    if (!container) return

    container.focus()
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
    rotate.angle = 0
    centralize()
    focus()
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
const saving = ref(false)

async function save() {
    if (saving.value || !project.value) return

    const db = $database.selected!

    saving.value = true

    const layers = board.layers.map((layer) => ({
        id: layer.id,
        data: JSON.parse(JSON.stringify(layer.get('data', []))),
    }))

    await db.projects.update(project.value.id, {
        layers,
    })

    setTimeout(() => {
        saving.value = false
    }, 1000)
}

// brush
const brushSize = ref(1)
const brushOpacity = ref(1)
const brushColor = ref({
    r: 0,
    g: 0,
    b: 0,
})
const brush = createBrush({
    size: brushSize,
    opacity: brushOpacity,
    color: brushColor,
})

const minBrushSize = computed(() => {
    return project.value?.width * 0.001
})

const maxBrushSize = computed(() => {
    return project.value?.width * 0.05
})

watch(
    project,
    (value) => {
        if (!value) return
        brushSize.value = value.width * 0.01
        brushOpacity.value = 1
    },
    { immediate: true }
)
</script>
<template>
    <div
        class="relative w-screen h-screen overflow-hidden"
        :style="{
            'background-size': `${boardWidth * 0.02}px ${boardWidth * 0.02}px`,
            'background-image': `
                linear-gradient(to right, var(--color-body-700) 1px, transparent 1px),
                linear-gradient(to bottom, var(--color-body-700) 1px, transparent 1px)
            `,
        }"
    >
        <div class="fixed top-0 left-0 flex flex-wrap gap-2 z-30 p-4">
            <cd-btn color="body-900" to="/" size="sq-sm" class="flex items-center justify-center">
                <cd-icon name="home" />
            </cd-btn>
            <cd-btn
                color="body-900"
                size="sq-sm"
                class="flex items-center justify-center"
                :loading="saving"
                @click="save"
            >
                <cd-icon name="mdi:content-save" />
            </cd-btn>
            <cd-btn
                color="body-900"
                size="sq-sm"
                class="flex items-center justify-center"
                @click="history.undo"
            >
                <cd-icon name="heroicons:arrow-uturn-left" />
            </cd-btn>
            <cd-btn
                color="body-900"
                size="sq-sm"
                class="flex items-center justify-center"
                @click="history.redo"
            >
                <cd-icon name="heroicons:arrow-uturn-right" />
            </cd-btn>
        </div>

        <div class="fixed top-0 right-0 flex gap-2 z-20 p-4">
            <cd-menu :close-on-content-click="false">
                <template #activator="{ attrs }">
                    <cd-btn
                        v-bind="attrs"
                        size="sq-md"
                        color="body-900"
                        class="flex items-center justify-center"
                    >
                        <div
                            class="size-6 rounded-full border-2 border-body-500"
                            :style="{
                                backgroundColor: `rgb(${brushColor.r}, ${brushColor.g}, ${brushColor.b})`,
                            }"
                        ></div>
                    </cd-btn>
                </template>
                <div class="py-2 px-4">
                    <cd-color-picker v-model="brushColor" />
                </div>
            </cd-menu>
        </div>

        <div class="fixed bottom-0 left-0 flex gap-2 z-20 p-4 h-dvh items-center">
            <div class="bg-body-900 p-2 flex flex-col gap-y-4">
                <cd-range
                    v-model="brushSize"
                    :min="minBrushSize"
                    :max="maxBrushSize"
                    step="1"
                    orientation="vertical"
                    class="h-56"
                />
                <cd-range
                    v-model="brushOpacity"
                    min="0"
                    max="1"
                    step="0.01"
                    orientation="vertical"
                    class="h-56"
                />
            </div>
        </div>

        <div class="fixed bottom-0 right-0 flex flex-wrap gap-2 z-20 p-4">
            <cd-btn
                color="body-900"
                size="sq-sm"
                class="flex items-center justify-center"
                @click="zoom.scale -= 0.1"
            >
                <cd-icon name="mdi:magnify-minus" />
            </cd-btn>
            <cd-btn
                color="body-900"
                size="sq-sm"
                class="flex items-center justify-center"
                @click="fit"
            >
                <cd-icon name="mdi:fit-to-screen" />
            </cd-btn>
            <cd-btn
                color="body-900"
                size="sq-sm"
                class="flex items-center justify-center"
                @click="zoom.scale += 0.1"
            >
                <cd-icon name="mdi:magnify-plus" />
            </cd-btn>
        </div>

        <cd-board
            :width="boardWidth"
            :height="boardHeight"
            :plugins="[transform, zoom, pan, rotate, history, brush]"
        >
            <cd-board-layer
                v-for="layer in layers"
                :key="layer.id"
                :width="canvasWidth"
                :height="canvasHeight"
                :x="canvasX"
                :y="canvasY"
                :data="layer.data"
            />
        </cd-board>
    </div>
</template>
