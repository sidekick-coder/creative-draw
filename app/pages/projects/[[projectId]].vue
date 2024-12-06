<script setup lang="ts">
import type CdCanvas from '~/components/CdCanvas.vue'
import type { ProjectParsed } from '#imports'
import { format } from 'date-fns'
import type ZoomDock from '~/components/ZoomDock.vue'

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
            current_scale: 1,
            current_offset_x: 0,
            current_offset_y: 0,
            layers: [
                {
                    id: window.crypto.randomUUID(),
                    name: 'Paint',
                    filename: 'paint',
                    order: 2,
                    type: 'paint',
                    width: width,
                    height: height,
                    visible: true,
                    data: new Uint8Array(width * height * 4),
                },
                {
                    id: window.crypto.randomUUID(),
                    name: 'Background',
                    filename: 'background',
                    order: 1,
                    type: 'paint',
                    width: width,
                    height: height,
                    visible: true,
                    data: new Uint8Array(width * height * 4).fill(255),
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
const brushSelected = ref('pen')

const brushSettings = ref({
    color: '0,0,0',
    size: 40,
    opacity: 0.5,
})

// zoom and pan
const containerRef = ref<HTMLDivElement>()
const zoomDockRef = ref<InstanceType<typeof ZoomDock>>()

const { space } = useMagicKeys()

const isPannig = ref(false)
let lastMouseX = 0
let lastMouseY = 0

function onWheel(event: WheelEvent) {
    event.preventDefault()

    if (!project.value) return

    const factor = 0.1
    const zoomDelta = event.deltaY < 0 ? 1 : -1
    const newScale = Math.max(0.1, project.value.current_scale + zoomDelta * factor)

    project.value.current_scale = newScale
}

function onMouseDown(event: MouseEvent) {
    if (!space?.value) return

    event.preventDefault()

    isPannig.value = true
    lastMouseX = event.clientX
    lastMouseY = event.clientY
}

function onMouseMove(event: MouseEvent) {
    if (!project.value || !isPannig.value) return

    project.value.current_offset_x += event.clientX - lastMouseX
    project.value.current_offset_y += event.clientY - lastMouseY
    lastMouseX = event.clientX
    lastMouseY = event.clientY
}

function onMouseUp() {
    isPannig.value = false
}

onLoad(containerRef, () => {
    nextTick(() => {
        zoomDockRef.value?.fitToScreen()
    })
})
</script>

<template>
    <div v-if="project" class="w-dvh relative flex h-dvh flex-col">
        <div class="absolute left-0 top-0 z-20 flex w-full items-center bg-body-900/50 px-4">
            <cd-btn padding="none" size="sm" variant="text" @click="navigateTo('/')">
                <cd-icon name="heroicons:home-20-solid" />
            </cd-btn>

            <brush-selector v-model="brushSelected" :brushes="brushes" />

            <cd-btn class="ml-4" :loading="saving" variant="text" @click="save">
                {{ $t('save') }}
            </cd-btn>

            <div class="flex-1"></div>

            <div class="flex items-center">
                <cd-menu :close-on-content-click="false" :close-on-outside-click="false">
                    <template #activator="{ attrs }">
                        <cd-btn v-bind="attrs" variant="text" padding="none" class="size-[56px]">
                            <cd-icon name="heroicons:square-2-stack-solid" />
                        </cd-btn>
                    </template>

                    <div class="p-4">
                        <layer-dock
                            v-model="project.selected_layer"
                            v-model:layers="project.layers"
                            :project="project"
                        />
                    </div>
                </cd-menu>

                <cd-menu :close-on-content-click="false">
                    <template #activator="{ attrs }">
                        <cd-btn v-bind="attrs" variant="text" padding="none" class="size-[56px]">
                            <cd-icon name="heroicons:magnifying-glass-plus" />
                        </cd-btn>
                    </template>

                    <div class="p-4">
                        <zoom-dock ref="zoomDockRef" v-model="project" :container-ref />
                    </div>
                </cd-menu>
            </div>
        </div>

        <div class="absolute left-0 top-0 z-20 flex h-full items-center px-2">
            <brush-controls v-model="brushSettings" :brush="brushSelected" />
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
                    :scale="project.current_scale"
                    :offset-x="project.current_offset_x"
                    :offset-y="project.current_offset_y"
                    class="absolute"
                    :style="{
                        'left': `${project.current_offset_x}px`,
                        'top': `${project.current_offset_y}px`,
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
