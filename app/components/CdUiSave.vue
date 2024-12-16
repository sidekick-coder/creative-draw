<script setup lang="ts">
import { createProject, updateProject, type ProjectData } from '~/repositories/projectRepository'

// general
const projectId = defineProp<string>('projectId', {
    type: String,
    default: null,
})

// save
const instance = useInstance()

const saving = ref(false)

async function saveProject() {
    saving.value = true

    const payload: Omit<ProjectData, 'id' | 'type'> = {
        width: instance.width,
        height: instance.height,
        layers: instance.layers.slice(),
    }

    const [project, error] = await tryCatch(() => updateProject(projectId.value, payload))

    if (error) {
        console.error(error)
        saving.value = false
        return
    }

    if (!projectId.value) {
        navigateTo(`/projects/${project.id}`)
        return
    }

    setTimeout(() => {
        saving.value = false
    }, 1000)
}

async function saveAs(type: string) {
    saving.value = true

    const payload: Omit<ProjectData, 'id'> = {
        type: type,
        width: instance.width,
        height: instance.height,
        layers: instance.layers.slice(),
    }

    const [project, error] = await tryCatch(() => createProject(payload))

    if (error) {
        console.error(error)
        saving.value = false
        return
    }

    if (!projectId.value) {
        navigateTo(`/projects/${project.id}`)
        return
    }

    setTimeout(() => {
        saving.value = false
    }, 1000)
}

async function saveImage(format: 'png' | 'jpeg') {
    saving.value = true

    const canvas = new OffscreenCanvas(instance.width, instance.height)
    const ctx = canvas.getContext('2d')!

    const layers = instance.layers
        .slice()
        .reverse()
        .filter((layer) => layer.visible)

    for (const layer of layers) {
        ctx.drawImage(layer.data, 0, 0)
    }

    const blob = await canvas.convertToBlob({ type: `image/${format}` })

    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')

    a.href = url
    a.download = `image.${format}`
    a.click()

    setTimeout(() => {
        saving.value = false
    }, 1000)
}

// menu
const menu = ref(false)

function onClick() {
    if (projectId.value && !menu.value) {
        return saveProject()
    }

    menu.value = !menu.value
}

function onLongPress(e: PointerEvent) {
    e.preventDefault()
    e.stopPropagation()

    menu.value = true
}
</script>

<template>
    <cd-menu v-model="menu" :open-on-click="false">
        <template #activator="{ attrs }">
            <cd-btn
                v-long-press="onLongPress"
                v-bind="attrs"
                variant="text"
                padding="none"
                size="md"
                :loading="saving"
                @click="onClick"
            >
                <cd-icon name="mdi:content-save" />
            </cd-btn>
        </template>

        <div class="p-2">
            <cd-card class="w-80">
                <cd-list-item v-if="projectId" @click="saveProject">
                    <cd-icon name="mdi:content-save" />

                    <div class="flex flex-col">
                        <div>Save</div>
                        <div class="text-xs text-body-200">Save current changes</div>
                    </div>
                </cd-list-item>

                <cd-list-item class="py-2 text-sm font-bold text-body-100" color="none">
                    Project
                </cd-list-item>

                <cd-list-item @click="saveAs('indexeddb')">
                    <cd-icon name="heroicons:circle-stack-solid" />

                    <div class="flex flex-col">
                        <div>Memory</div>
                        <div class="text-xs text-body-200">Save project in a browser memory</div>
                    </div>
                </cd-list-item>

                <cd-list-item :disabled="!$flags.fsa" @click="saveAs('filesystem')">
                    <cd-icon name="heroicons:folder-solid" />

                    <div class="flex flex-col">
                        <div>Folder</div>
                        <div class="text-xs text-body-200">Save project in a local folder</div>

                        <div v-if="!$flags.fsa" class="text-xs text-body-200">
                            Not available in this browser
                        </div>
                    </div>
                </cd-list-item>

                <cd-list-item class="py-2 text-sm font-bold text-body-100" color="none">
                    Image
                </cd-list-item>
                <cd-list-item @click="saveImage('png')">
                    <cd-icon name="mdi:image" />

                    <div class="flex flex-col">
                        <div>PNG</div>
                        <div class="text-xs text-body-200">Export project as a PNG image</div>
                    </div>
                </cd-list-item>

                <cd-list-item @click="saveImage('jpeg')">
                    <cd-icon name="mdi:image" />

                    <div class="flex flex-col">
                        <div>JPG</div>
                        <div class="text-xs text-body-200">Export project as a JPG image</div>
                    </div>
                </cd-list-item>
            </cd-card>
        </div>
    </cd-menu>
</template>
