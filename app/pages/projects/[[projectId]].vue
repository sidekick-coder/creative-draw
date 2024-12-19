<script setup lang="ts">
import type { Layer } from '@/composables/useInstance'
import { findProject } from '~/repositories/projectRepository'
const instance = useInstance()
const route = useRoute()

const projectId = computed(() => route.params.projectId as string)

const width = ref(500)
const height = ref(500)

async function setProject() {
    if (!projectId.value) return

    const [project, error] = await tryCatch(() => findProject(projectId.value))

    if (error) {
        console.error(error)
        navigateTo('/')
        return
    }

    width.value = project.width
    height.value = project.height

    instance.setLayers(project.layers)

    const firstLayerId = project.layers[0]?.id

    if (firstLayerId) {
        instance.setActiveLayer(firstLayerId)
    }
}

function setNewProject() {
    const w = route.query.width ? Number(route.query.width) : 500
    const h = route.query.height ? Number(route.query.height) : 500

    width.value = w
    height.value = h

    const bgLayer: Layer = {
        id: createId(),
        name: 'Background',
        order: 1,
        type: 'paint',
        width: w,
        height: h,
        data: new OffscreenCanvas(w, h),
        visible: true,
    }

    const paintLayer: Layer = {
        id: createId(),
        name: 'Paint',
        order: 2,
        type: 'paint',
        width: w,
        height: h,
        data: new OffscreenCanvas(w, h),
        visible: true,
    }

    const ctx = bgLayer.data.getContext('2d')!

    ctx.fillStyle = 'white'

    ctx.fillRect(0, 0, w, h)

    instance.setLayers([paintLayer, bgLayer])
    instance.setActiveLayer(paintLayer.id)
}

onMounted(async () => {
    if (!projectId.value) {
        return setNewProject()
    }

    await setProject()
})
</script>

<template>
    <cd-instance class="h-dvh w-dvw" :height :width>
        <cd-tool-pan />
        <cd-tool-zoom />
        <cd-tool-brush />
        <cd-tool-eraser />

        <cd-ui-brush-settings />

        <cd-ui-toolbar class="absolute left-2 top-2">
            <cd-btn padding="none" size="md" variant="text" @click="navigateTo('/')">
                <cd-icon name="heroicons:home-20-solid" />
            </cd-btn>

            <cd-ui-save :project-id />

            <cd-ui-history />
        </cd-ui-toolbar>

        <cd-ui-toolbar class="absolute right-2 top-2">
            <cd-ui-tool-eraser />
            <cd-ui-tool-brush />
            <cd-ui-layer-list />
            <cd-ui-color-picker />
        </cd-ui-toolbar>

        <cd-ui-toolbar class="absolute bottom-2 right-2">
            <cd-ui-tool-zoom />
        </cd-ui-toolbar>

        <cd-layer-list />
    </cd-instance>
</template>
