<script setup lang="ts">
import pen from '@/brushes/pen'
import { createTransform } from '@/composables/createTransform'
import type Project from '@/entities/Project'
import { useLocalStorage } from '@vueuse/core'

// general
const route = useRoute('/workspaces/[workspaceId]/projects/[id]')
const router = useRouter()
const workspace = useWorkspace()

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
const projectId = computed(() => route.params.id)
const project = ref<Project>()

async function setProject() {
    const response = await workspace.projects.find(route.params.id)

    if (!response) {
        return router.push(`/workspaces/${route.params.workspaceId}/projects`)
    }

    project.value = response
}

watch(projectId, setProject, { immediate: true })

// layers
const layers = ref<Layer[]>([])
const activeLayerId = ref<string>()

async function loadLayers() {
    if (!project.value) return

    const projectLayers = [] as Layer[]

    const response = await workspace.layers.list({
        projectId: project.value.id,
    })

    for (const layerData of response) {
        const layer = createLayer(layerData)

        // set the active layer if not set
        if (!activeLayerId.value) {
            activeLayerId.value = layer.id
        }

        projectLayers.push(layer)
    }

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

    saving.value = true

    for (const layer of layers.value) {
        const payload = layer.serialize()

        if (!(await workspace.layers.find(layer.id))) {
            await workspace.layers.create({
                ...payload,
                project_id: project.value.id,
            })
            continue
        }

        await workspace.layers.update(layer.id, {
            ...payload,
            project_id: project.value.id,
        })
    }

    setTimeout(() => {
        saving.value = false
    }, 1000)
}

// brush
const brushSelected = useLocalStorage('cd-brush-selected', 'pen')
const brushes = useBrushes()

const definition = computed(() => {
    return brushes.find((b) => b.id === brushSelected.value) || pen
})

const brush = createBrush({
    definition,
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
        brush.size = value.width * 0.01
        brush.opacity = 1
    },
    { immediate: true }
)

// export
const exporting = ref(false)

async function exportTo(format: 'PNG' | 'JPEG') {
    exporting.value = true

    const canvas = new OffscreenCanvas(canvasWidth.value, canvasHeight.value)
    const context = canvas.getContext('2d')

    if (!context) {
        exporting.value = false
        return
    }

    for (const layer of layers.value.toReversed()) {
        const layerCanvas = layer.get('canvas')
        const color = layer.backgroundColor

        if (color) {
            context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
            context.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
        }

        context.drawImage(layerCanvas, 0, 0, canvasWidth.value, canvasHeight.value)
    }

    const mime = format === 'JPEG' ? 'image/jpeg' : 'image/png'
    const options = mime === 'image/jpeg' ? { quality: 0.92, type: mime } : { type: mime }
    const ext = format === 'JPEG' ? 'jpg' : 'png'

    const data = await canvas.convertToBlob(options)

    const link = document.createElement('a')
    link.href = URL.createObjectURL(data)
    link.download = `project-${project.value?.id}.${ext}`
    link.click()

    setTimeout(() => {
        exporting.value = false
    }, 1000)
}
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
        <div
            v-if="exporting"
            class="fixed inset-0 bg-body-900/50 flex items-center justify-center z-50"
        >
            <cd-spinner class="size-16" />
        </div>

        <div class="fixed top-0 left-0 flex flex-wrap gap-2 z-30 p-4">
            <cd-btn
                color="body-900"
                :to="`/workspaces/${route.params.workspaceId}/projects`"
                size="sq-md"
                class="flex items-center justify-center"
            >
                <cd-icon name="home" />
            </cd-btn>
            <cd-menu placement="bottom-start">
                <template #activator="{ attrs }">
                    <cd-btn v-bind="attrs" size="sq-md" color="body-900">
                        <cd-icon name="heroicons:cog-8-tooth" />
                    </cd-btn>
                </template>
                <div class="py-2 px-4">
                    <cd-card class="border-2 border-body-600 min-w-64">
                        <cd-list-item @click="exportTo('PNG')">
                            {{ $t('Export {0}', ['PNG']) }}
                        </cd-list-item>
                        <cd-list-item @click="exportTo('JPEG')">
                            {{ $t('Export {0}', ['JPEG']) }}
                        </cd-list-item>
                    </cd-card>
                </div>
            </cd-menu>
            <cd-btn
                color="body-900"
                size="sq-md"
                class="flex items-center justify-center"
                :loading="saving"
                @click="save"
            >
                <cd-icon name="mdi:content-save" />
            </cd-btn>
            <cd-btn
                color="body-900"
                size="sq-md"
                class="flex items-center justify-center"
                :disabled="!history.undoStack.length"
                @click="history.undo"
            >
                <cd-icon name="heroicons:arrow-uturn-left" />
            </cd-btn>
            <cd-btn
                color="body-900"
                size="sq-md"
                class="flex items-center justify-center"
                :disabled="!history.redoStack.length"
                @click="history.redo"
            >
                <cd-icon name="heroicons:arrow-uturn-right" />
            </cd-btn>
            <cd-btn
                color="body-900"
                size="sq-md"
                class="flex items-center justify-center"
                @click="board.emitter.emit('redraw')"
            >
                <cd-icon name="heroicons:arrow-path" />
            </cd-btn>
        </div>

        <div class="fixed top-0 right-0 flex gap-2 z-20 p-4">
            <cd-btn
                size="sq-md"
                color="body-900"
                :class="brush.erase ? 'bg-primary-300' : ''"
                @click="brush.erase = !brush.erase"
            >
                <cd-icon name="mdi:eraser" />
            </cd-btn>
            <cd-menu :close-on-content-click="false">
                <template #activator="{ attrs }">
                    <cd-btn v-bind="attrs" size="sq-md" color="body-900">
                        <cd-icon name="heroicons:paint-brush-solid" />
                    </cd-btn>
                </template>
                <div class="py-2 px-4">
                    <cd-brush-list v-model="brushSelected" />
                </div>
            </cd-menu>
            <cd-btn
                size="sq-md"
                color="body-900"
                :class="pan.active ? 'bg-primary-300' : ''"
                @click="pan.toggle"
            >
                <cd-icon name="mdi:hand-back-left" />
            </cd-btn>

            <cd-menu :close-on-content-click="false">
                <template #activator="{ attrs }">
                    <cd-btn v-bind="attrs" size="sq-md" color="body-900">
                        <cd-icon name="streamline-ultimate:layers-stacked-bold" />
                    </cd-btn>
                </template>
                <div class="py-2 px-4">
                    <cd-card class="border-2 border-body-600 min-w-64">
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

            <cd-color-picker v-model="brush.color" />
        </div>

        <div class="fixed bottom-0 left-0 flex gap-2 z-20 p-4 h-dvh items-center">
            <div class="bg-body-900 p-2 flex flex-col gap-y-4">
                <cd-range
                    v-model="brush.size"
                    :min="minBrushSize"
                    :max="maxBrushSize"
                    step="1"
                    size="1.2rem"
                    orientation="vertical"
                    class="h-[30dvh] w-6"
                />
                <cd-range
                    v-model="brush.opacity"
                    min="0"
                    max="1"
                    step="0.01"
                    size="1.2rem"
                    orientation="vertical"
                    class="h-[30dvh] w-6"
                />
            </div>
        </div>

        <div class="fixed bottom-0 right-0 flex flex-wrap gap-2 z-20 p-4">
            <cd-btn
                color="body-900"
                size="sq-md"
                class="flex items-center justify-center"
                @click="zoom.scale -= 0.1"
            >
                <cd-icon name="mdi:magnify-minus" />
            </cd-btn>
            <cd-btn
                color="body-900"
                size="sq-md"
                class="flex items-center justify-center"
                @click="fit"
            >
                <cd-icon name="mdi:fit-to-screen" />
            </cd-btn>
            <cd-btn
                color="body-900"
                size="sq-md"
                class="flex items-center justify-center"
                @click="zoom.scale += 0.1"
            >
                <cd-icon name="mdi:magnify-plus" />
            </cd-btn>
        </div>

        <cd-board
            :width="boardWidth"
            :height="boardHeight"
            :plugins="[transform, zoom, pan, rotate, brush, history]"
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
