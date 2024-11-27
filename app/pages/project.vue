<script setup lang="ts">
import { pbkdf2 } from 'node:crypto'
import type { argv0 } from 'node:process'
import type CdCanvas from '~/components/CdCanvas.vue'

const directory = ref<FileSystemDirectoryHandle>()

interface Layer {
    name: string
    description: string
    type: string
    data: string
}

interface Project {
    name: string
    description: string
    layers: Layer[]
    width: number
    height: number
}

const project = ref<Project>({
    name: '2024-01-01',
    description: '',
    layers: [],
    width: 500,
    height: 500,
})

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

const canvasRef = ref<InstanceType<typeof CdCanvas>>()

async function writeLayers(handle: FileSystemDirectoryHandle) {
    const image = await canvasRef.value?.toBlob()

    const fileHandle = await handle.getFileHandle(`${project.value.name}.png`, {
        create: true,
    })

    const writable = await fileHandle.createWritable()

    await writable.write(image)

    await writable.close()
}

async function save() {
    if (!canvasRef.value || !project.value.name) return

    if (!directory.value) {
        directory.value = await window.showDirectoryPicker()
    }

    if (!directory.value) return

    const projectFolder = await directory.value.getDirectoryHandle(project.value.name, {
        create: true,
    })

    const layerFolder = await projectFolder.getDirectoryHandle('layers', {
        create: true,
    })

    await writeLayers(layerFolder)

    const projectFile = await projectFolder.getFileHandle('index.json', {
        create: true,
    })

    const writable = await projectFile.createWritable()

    await writable.write(JSON.stringify(project.value, null, 2))

    await writable.close()
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

    offsetX.value = ((rects?.width || 0) - project.value.width) / 2
    offsetY.value = ((rects?.height || 0) - project.value.height) / 2
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
    if (!space) return

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
                @mousedown="onMouseDown"
                @mousemove="onMouseMove"
                @mouseup="onMouseUp"
            >
                <cd-canvas
                    ref="canvasRef"
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
                        left: `${offsetX}px`,
                        top: `${offsetY}px`,
                    }"
                />
            </div>
        </ClientOnly>
    </div>
</template>
