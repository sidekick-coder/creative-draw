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
        const width = 800
        const height = 600

        project.value = {
            name: format(new Date(), 'yyyy-MM-dd'),
            width: width,
            height: height,
            layers: [
                {
                    name: 'background',
                    filename: 'background',
                    order: 1,
                    type: 'paint',
                    data: new Uint8Array(width * height * 4).fill(255),
                },
                {
                    name: 'paint',
                    filename: 'paint',
                    order: 2,
                    type: 'paint',
                    data: new Uint8Array(width * height * 4),
                },
            ],
        }

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
    size: 5,
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

function setInitialOffset() {
    if (!containerRef.value) return

    const [rects] = containerRef.value.getClientRects()

    if (!rects) return

    // centralize the project in the container
    offsetX.value = (rects.width - project.value.width) / 2
    offsetY.value = (rects.height - project.value.height) / 2
}

function resetScale() {
    scale.value = 1

    setInitialOffset()
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

onLoad(containerRef, setInitialOffset)
</script>

<template>
    <div v-if="project" class="w-dvh flex h-dvh flex-col">
        <div class="flex h-10 items-center px-4">
            <cd-btn padding="none" size="sm" variant="text" @click="navigateTo('/')">
                <cd-icon name="heroicons:home-20-solid" />
            </cd-btn>

            <brush-selector v-model="brushSelected" :brushes="brushes" />

            <cd-menu>
                <template #activator="{ attrs }">
                    <cd-btn v-bind="attrs" variant="text"> Layers </cd-btn>
                </template>

                <cd-card>
                    <cd-list-item v-for="layer in project.layers" :key="layer.name">
                        {{ layer.name }}
                    </cd-list-item>
                </cd-card>
            </cd-menu>

            <cd-btn class="ml-4" :loading="saving" variant="text" @click="save">
                {{ $t('save') }}
            </cd-btn>

            <div class="flex-1"></div>

            <div class="flex items-center gap-x-2">
                <cd-btn padding="none" size="sm" @click="resetScale">
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
                class="relative flex w-full flex-1 items-center justify-center overflow-hidden bg-body-700"
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
                        'pointer-events': space ? 'none' : 'auto',
                        'z-index': layer.order,
                    }"
                />
            </div>
        </ClientOnly>
    </div>
</template>
