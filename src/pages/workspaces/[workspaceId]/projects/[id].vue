<script setup lang="ts">
import { createTransform } from '@/composables/createTransform'
import type Project from '@/entities/Project'
import LayerGroup from '@/entities/LayerGroup'
import { useLocalStorage } from '@vueuse/core'
import { toggleEruda } from '@/plugins/eruda'

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

async function refresh() {
    loading.value = true
    await setProject()
    await loadLayers()
    setCanvasSizes()
    await new Promise((resolve) => setTimeout(resolve, 100))
    loading.value = false
}

const loading = ref(false)

watch(projectId, setProject, { immediate: true })

// layers
const layers = ref<Layer[]>([])
const activeLayerId = ref<string>()
const layerGroups = ref<LayerGroup[]>([])

async function loadLayers() {
    layers.value = []
    layerGroups.value = []

    if (!project.value) return

    const projectLayers = [] as Layer[]

    const response = await workspace.layers.list({
        projectId: project.value.id,
    })

    // sort layers by order
    response.sort((a, b) => b.order - a.order)

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

    layerGroups.value = await workspace.layerGroups.list({ projectId: project.value.id })
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

async function saveThumbnail() {
    const canvas = new OffscreenCanvas(canvasWidth.value, canvasHeight.value)
    const context = canvas.getContext('2d')

    if (!context) return

    for (const layer of layers.value.toReversed()) {
        const layerCanvas = layer.get('canvas')
        const color = layer.backgroundColor

        if (color) {
            context.fillStyle = `rgb(${color.r}, ${color.g}, ${color.b})`
            context.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
        }

        context.drawImage(layerCanvas, 0, 0, canvasWidth.value, canvasHeight.value)
    }

    const blob = await canvas.convertToBlob({
        type: 'image/png',
    })

    const uint8 = await $uint8.fromBlob(blob)

    await workspace.files.write(uint8, {
        filename: project.value?.thumbnailFilename,
    })
}

async function save() {
    if (saving.value || !project.value) return

    saving.value = true

    // set layer order
    layers.value.forEach((layer, index) => {
        layer.order = layers.value.length - index
    })

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

    for (const group of layerGroups.value) {
        const payload = { ...group, project_id: project.value.id }

        if (!(await workspace.layerGroups.find(group.id))) {
            await workspace.layerGroups.create(payload)
            continue
        }

        await workspace.layerGroups.update(group.id, payload)
    }

    await saveThumbnail()

    setTimeout(() => {
        saving.value = false
    }, 1000)
}

// brush
const brushSelected = useLocalStorage('cd-brush-selected', 'pen')
const brushes = useBrushes()

const definition = computed(() => {
    return brushes.find((b) => b.id === brushSelected.value) || brushes[0]
})

const brush = createBrush({
    definition,
    size: useLocalStorage('cd-brush-size', 1),
    opacity: useLocalStorage('cd-brush-opacity', 1),
})

const minBrushSize = computed(() => {
    return project.value?.width * 0.001
})

const maxBrushSize = computed(() => {
    return project.value?.width * 0.05
})

// edit title
const editTitleDialog = ref(false)
const editTitleValue = ref('')

function openEditTitle() {
    editTitleValue.value = project.value?.name || ''
    editTitleDialog.value = true
}

async function saveTitle() {
    if (!project.value) return

    project.value.name = editTitleValue.value

    await workspace.projects.update(project.value.id, {
        name: editTitleValue.value,
    })

    editTitleDialog.value = false
}

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
    <div class="w-dvw h-dvh">
        <div
            v-if="loading"
            class="fixed inset-0 bg-body-900 flex items-center justify-center z-[100]"
        >
            <cd-spinner class="size-10" />
        </div>
        <div
            v-else
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

            <div
                class="fixed top-0 left-0 right-0 flex items-center justify-center z-20 p-4 pointer-events-none"
            >
                <span class="text-body-300 text-sm font-medium truncate max-w-xs">
                    {{ project?.name || $t('Untitled') }}
                </span>
            </div>

            <cd-dialog v-model="editTitleDialog">
                <cd-card class="w-80">
                    <cd-card-head>
                        <cd-card-title class="mr-auto text-base">{{
                            $t('Edit title')
                        }}</cd-card-title>
                    </cd-card-head>
                    <cd-card-content class="flex flex-col gap-y-4">
                        <cd-text-field
                            v-model="editTitleValue"
                            :label="$t('Title')"
                            :placeholder="$t('Title')"
                        />
                        <cd-btn @click="saveTitle">
                            {{ $t('Save') }}
                        </cd-btn>
                    </cd-card-content>
                </cd-card>
            </cd-dialog>

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
                    <div class="py-2">
                        <cd-card class="border-2 border-body-600 min-w-64">
                            <cd-list-item @click="exportTo('PNG')">
                                <cd-icon name="mdi:file-png-box" class="mr-2" />
                                {{ $t('Export {0}', ['PNG']) }}
                            </cd-list-item>
                            <cd-list-item @click="exportTo('JPEG')">
                                <cd-icon name="mdi:file-jpg-box" class="mr-2" />
                                {{ $t('Export {0}', ['JPEG']) }}
                            </cd-list-item>
                            <cd-list-item @click="toggleEruda">
                                <cd-icon name="heroicons:code-solid" class="mr-2" />
                                {{ $t('Toggle Eruda') }}
                            </cd-list-item>
                            <cd-list-item @click="openEditTitle">
                                <cd-icon name="heroicons:pencil-solid" class="mr-2" />
                                {{ $t('Edit title') }}
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
                    @click="refresh"
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

                <cd-color-picker v-model="brush.color" />

                <cd-menu :close-on-content-click="false">
                    <template #activator="{ attrs }">
                        <cd-btn v-bind="attrs" size="sq-md" color="body-900">
                            <cd-icon name="streamline-ultimate:layers-stacked-bold" />
                        </cd-btn>
                    </template>
                    <div class="py-2 px-4">
                        <cd-card class="border-2 border-body-600 min-w-64">
                            <cd-board-layer-list
                                v-model:layers="layers"
                                v-model:active-layer-id="activeLayerId"
                            />
                        </cd-card>
                    </div>
                </cd-menu>
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
    </div>
</template>
