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
const layers = ref<Layer[]>([])
const activeLayerId = ref<string>()

function loadLayers() {
    if (!project.value) return

    const projectLayers = [] as Layer[]

    project.value.layers?.forEach((layerData: any) => {
        const layer = createLayer(layerData)

        projectLayers.push(layer)
    })

    if (!projectLayers.length) {
        projectLayers.push(
            createLayer({ name: 'New Layer' }),
            createLayer({
                name: 'Background',
                background_color: {
                    r: 255,
                    g: 255,
                    b: 255,
                },
            })
        )
    }

    layers.value = projectLayers
    activeLayerId.value = layers.value[0]?.id
}

function addLayer() {
    const newLayer = createLayer()

    layers.value.unshift(newLayer)
}

function moveLayer(layer: Layer, direction: 'up' | 'down') {
    const index = layers.value.indexOf(layer)

    if (index === -1) return

    if (direction === 'up' && index > 0) {
        layers.value.splice(index, 1)
        layers.value.splice(index - 1, 0, layer)
        return
    }

    layers.value.splice(index, 1)
    layers.value.splice(index + 1, 0, layer)
}

function deleteLayer(layer: Layer) {
    const index = layers.value.indexOf(layer)

    if (index === -1) return

    layers.value.splice(index, 1)

    if (activeLayerId.value === layer.id) {
        activeLayerId.value = layers.value[index - 1]?.id
    }
}

watch(project, loadLayers, { immediate: true })

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

    const projectLayers = layers.value.map((layer) => layer.serialize())

    console.debug('[save]', projectLayers)

    await db.projects.update(project.value.id, {
        layers: projectLayers,
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
        class="relative w-dvw h-dvh overflow-hidden"
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
                    <cd-btn v-bind="attrs" size="sq-md" color="body-900">
                        <cd-icon name="streamline-ultimate:layers-stacked-bold" />
                    </cd-btn>
                </template>
                <div class="py-2 px-4">
                    <cd-card class="border-2 border-body-600">
                        <cd-card-head class="border-b border-body-600">
                            <cd-card-title class="mr-auto text-base">Layers</cd-card-title>
                            <cd-btn variant="text" size="sq-md" @click="addLayer">
                                <cd-icon name="heroicons:plus-20-solid" />
                            </cd-btn>
                        </cd-card-head>
                        <cd-board-layer-list-item
                            v-for="layer in layers"
                            :key="layer.id"
                            v-model:active-id="activeLayerId"
                            :layer
                            @move-up="moveLayer(layer, 'up')"
                            @move-down="moveLayer(layer, 'down')"
                            @delete="deleteLayer(layer)"
                        >
                            {{ layer.id }}
                        </cd-board-layer-list-item>
                    </cd-card>
                </div>
            </cd-menu>

            <cd-color-picker v-model="brushColor" />
        </div>

        <div class="fixed bottom-0 left-0 flex gap-2 z-20 p-4 h-dvh items-center">
            <div class="bg-body-900 p-2 flex flex-col gap-y-4">
                <cd-range
                    v-model="brushSize"
                    :min="minBrushSize"
                    :max="maxBrushSize"
                    step="1"
                    orientation="vertical"
                    class="h-56 w-4"
                />
                <cd-range
                    v-model="brushOpacity"
                    min="0"
                    max="1"
                    step="0.01"
                    orientation="vertical"
                    class="h-56 w-4"
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
            :style="{
                'will-change': 'transform',
            }"
        >
            <cd-board-layer
                v-for="(layer, index) in layers"
                :key="layer.id"
                :width="canvasWidth"
                :height="canvasHeight"
                :x="canvasX"
                :y="canvasY"
                :layer="layer"
                :style="{
                    'z-index': layers.length - index,
                    'pointer-events': activeLayerId === layer.id ? 'auto' : 'none',
                }"
            />
        </cd-board>
    </div>
</template>
