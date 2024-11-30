<script setup lang="ts">
import type CdCanvas from '~/components/CdCanvas.vue'
import type { ProjectParsed } from '#imports'
import { format } from 'date-fns'
import orderBy from 'lodash/orderBy'

const directory = ref<FileSystemDirectoryHandle>()

const project = ref<ProjectParsed>({
    name: '',
    description: '',
    layers: [],
    width: 1200,
    height: 1200,
})

// general
const route = useRoute()

// project
const projectId = computed(() => route.params.projectId as string | undefined)

async function setProject() {
    if (!projectId.value) {
        project.value.name = format(new Date(), 'yyyy-MM-dd')

        const backgroundLayer = {
            name: 'background',
            description: 'background',
            order: 0,
            type: 'paint',
            data: new Uint8Array(project.value.width * project.value.height * 4).fill(255),
        }
        // paint layer
        const paintLayer = {
            name: 'paint',
            description: 'paint',
            order: 1,
            type: 'paint',
            data: new Uint8Array(project.value.width * project.value.height * 4),
        }

        project.value.layers = [backgroundLayer, paintLayer]
        return
    }

    const response = await showProject(projectId.value)

    if (response) {
        project.value = response
    }
}

if (process.client) {
    watch(projectId, setProject, { immediate: true })
}

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

async function save() {
    if (!directory.value) {
        directory.value = await window.showDirectoryPicker()
    }

    if (!directory.value) return

    const created = await createProject(directory.value, project.value)

    navigateTo(`/projects/${created.id}`)
}

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
    <div class="w-dvh flex h-dvh flex-col">
        <div class="flex h-10 px-4">
            <input v-model="project.name" label="Name" class="bg-transparent focus:bg-body-600" />

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

            <cd-btn class="ml-4" @click="save">
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
