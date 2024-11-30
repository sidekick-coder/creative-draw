<script setup lang="ts">
import type CdCanvas from '~/components/CdCanvas.vue'
import type { ProjectParsed } from '#imports'
import { format } from 'date-fns'

// general
const route = useRoute()

// project
const projectId = computed(() => Number(route.params.projectId) || undefined)

const project = ref<ProjectParsed>()
const handle = ref<FileSystemDirectoryHandle>()
const saving = ref(false)

async function setProject() {
    if (!projectId.value) {
        const width = Number(route.query.width) || 800
        const height = Number(route.query.height) || 600

        project.value = {
            name: format(new Date(), 'yyyy-MM-dd'),
            width: width,
            height: height,
            layers: [
                {
                    id: window.crypto.randomUUID(),
                    name: 'background',
                    filename: 'background',
                    order: 1,
                    type: 'paint',
                    width: width,
                    height: height,
                    visible: true,
                    data: new Uint8Array(width * height * 4).fill(255),
                },
                {
                    id: window.crypto.randomUUID(),
                    name: 'paint',
                    filename: 'paint',
                    order: 2,
                    type: 'paint',
                    width: width,
                    height: height,
                    visible: true,
                    data: new Uint8Array(width * height * 4),
                },
            ],
        }

        project.value.selected_layer = project.value.layers[1]!.id

        return
    }

    const response = await $db.handles.get(projectId.value)

    if (!response) {
        navigateTo('/')
        return
    }

    const parsed = await parseProject(response.handle)

    project.value = parsed
    handle.value = response.handle
}

async function create() {
    const handle = await window.showDirectoryPicker({
        mode: 'readwrite',
    })

    await saveProject(handle, project.value!)

    const exists = await $db.handles.where('name').equals(handle.name).first()

    if (exists) {
        await $db.handles.delete(exists.id)
    }

    const id = await $db.handles.add({
        handle,
        name: handle.name,
    })

    navigateTo(`/projects/${id}`)
}

async function update() {
    if (!handle.value || !project.value) return

    await saveProject(handle.value, project.value)
}

async function save() {
    saving.value = true

    const promise = handle.value ? update : create

    await promise().catch((error) => {
        console.error(error)
    })

    setTimeout(() => {
        saving.value = false
    }, 800)
}

onMounted(setProject)

watch(projectId, setProject)

// brushes
const files = import.meta.glob('~/brushes/*.ts', {
    eager: true,
})

const all = Object.values(files).map((file: any) => file.default)

const brushes = ref<Brush[]>(all)
const brushSelected = ref('brush')

const brushSettings = ref({
    color: '#000000',
    size: 40,
})

// zoom and pan
const containerRef = ref<HTMLDivElement>()
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)

const { space } = useMagicKeys()

const isPannig = ref(false)
let lastMouseX = 0
let lastMouseY = 0

function centralize() {
    if (!containerRef.value || !project.value) return

    const [rects] = containerRef.value.getClientRects()

    if (!rects) return

    const currentWidth = project.value.width * scale.value
    const currentHeight = project.value.height * scale.value

    // centralize the project in the container
    offsetX.value = (rects.width - currentWidth) / 2
    offsetY.value = (rects.height - currentHeight) / 2
}

function fitToScreen() {
    if (!containerRef.value || !project.value) return

    const [rects] = containerRef.value.getClientRects()

    if (!rects) return

    const paddingX = 80
    const paddingY = 80 + 56 // 56 is the height of the top bar

    const availableWidth = rects.width - paddingX * 2
    const availableHeight = rects.height - paddingY * 2

    const scaleWidth = availableWidth / project.value.width
    const scaleHeight = availableHeight / project.value.height

    scale.value = Math.min(scaleWidth, scaleHeight)

    nextTick(centralize)
}

function onZoom(value: number) {
    scale.value = Math.min(Math.max(0.1, scale.value + value), 20)
}

function onWheel(event: WheelEvent) {
    event.preventDefault()

    const factor = 0.1
    const zoomDelta = event.deltaY < 0 ? 1 : -1
    const newScale = Math.max(0.1, scale.value + zoomDelta * factor)

    scale.value = newScale
}

function onMouseDown(event: MouseEvent) {
    if (!space?.value) return

    event.preventDefault()

    isPannig.value = true
    lastMouseX = event.clientX
    lastMouseY = event.clientY
}

function onMouseMove(event: MouseEvent) {
    if (isPannig.value) {
        offsetX.value += event.clientX - lastMouseX
        offsetY.value += event.clientY - lastMouseY
        lastMouseX = event.clientX
        lastMouseY = event.clientY
    }
}

function onMouseUp() {
    isPannig.value = false
}

onLoad(containerRef, fitToScreen)
</script>

<template>
    <div v-if="project" class="w-dvh flex h-dvh flex-col">
        <div class="absolute left-0 top-0 z-20 flex w-full items-center bg-body-900/50 px-4">
            <cd-btn padding="none" size="sm" variant="text" @click="navigateTo('/')">
                <cd-icon name="heroicons:home-20-solid" />
            </cd-btn>

            <brush-selector v-model="brushSelected" :brushes="brushes" />

            <cd-btn class="ml-4" :loading="saving" variant="text" @click="save">
                {{ $t('save') }}
            </cd-btn>

            <div class="flex-1"></div>

            <div class="flex items-center gap-x-2">
                <cd-menu :close-on-content-click="false" :close-on-outside-click="false">
                    <template #activator="{ attrs }">
                        <cd-btn v-bind="attrs" variant="text" padding="none" class="size-[56px]">
                            <cd-icon name="heroicons:square-2-stack-solid" />
                        </cd-btn>
                    </template>

                    <div class="pt-4">
                        <layer-dock
                            v-model="project.selected_layer"
                            v-model:layers="project.layers"
                        />
                    </div>
                </cd-menu>

                <cd-btn padding="none" size="sm" @click="fitToScreen">
                    <cd-icon name="heroicons:arrows-pointing-out-20-solid" />
                </cd-btn>

                <cd-btn padding="none" size="sm" @click="onZoom(0.1)">
                    <cd-icon name="heroicons:magnifying-glass-plus" />
                </cd-btn>

                <div>
                    <span>{{ $number.percentage(scale) }}</span>
                </div>

                <cd-btn padding="none" size="sm" @click="onZoom(-0.1)">
                    <cd-icon name="heroicons:magnifying-glass-minus" />
                </cd-btn>
            </div>
        </div>

        <ClientOnly>
            <div
                ref="containerRef"
                class="relative z-10 flex w-full flex-1 items-center justify-center overflow-hidden bg-body-700"
                :class="[isPannig ? 'cursor-grabbing' : '', space ? 'cursor-grab' : '']"
                @wheel="onWheel"
                @pointerdown="onMouseDown"
                @pointermove="onMouseMove"
                @pointerup="onMouseUp"
                @touchmove.prevent
            >
                <cd-canvas
                    v-for="layer in project.layers"
                    :key="layer.name"
                    v-model="layer.data"
                    :brushes
                    :brush-selected
                    :brush-settings
                    :width="project.width"
                    :height="project.height"
                    :scale
                    :offset-x
                    :offset-y
                    class="absolute"
                    :style="{
                        'left': `${offsetX}px`,
                        'top': `${offsetY}px`,
                        'pointer-events':
                            space || project.selected_layer !== layer.id || !layer.visible
                                ? 'none'
                                : 'auto',
                        'z-index': layer.order,
                        'opacity': layer.visible ? 1 : 0,
                    }"
                />
            </div>
        </ClientOnly>
    </div>
</template>
