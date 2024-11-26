<script setup lang="ts">
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
</script>

<template>
    <div class="w-dvh h-dvh">
        <div class="h-10 px-4">
            <input v-model="project.name" label="Name" class="bg-transparent focus:bg-body-600" />

            <brush-selector v-model="brushSelected" :brushes="brushes" />

            <cd-btn class="ml-4" @click="save">
                {{ $t('save') }}
            </cd-btn>
        </div>

        <div class="flex h-[calc(100%-2.5rem)] w-full items-center justify-center bg-body-700">
            <cd-canvas
                ref="canvasRef"
                :brushes
                :brush-selected
                :brush-settings
                :width="project.width"
                :height="project.height"
            />
        </div>
    </div>
</template>
