<script setup lang="ts">
import { findProject } from '~/repositories/projectRepository'
const instance = useInstance()
const route = useRoute()

const projectId = computed(() => route.query.projectId as string)

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

    const bgLayer = makeLayer({
        id: createId(),
        name: 'Background',
        width: w,
        height: h,
    })

    const paintLayer = makeLayer({
        id: createId(),
        name: 'Paint',
        order: 2,
        type: 'paint',
        width: w,
        height: h,
    })

    // fill bg layer
    bgLayer.points.push({
        x: 0,
        y: 0,
        opacity: 1,
        color: { r: 255, g: 255, b: 255 },
        width: w,
        height: h,
        shape: 'rect',
    })

    instance.setLayers([paintLayer, bgLayer])
    instance.setActiveLayer(paintLayer.id)
}

onMounted(async () => {
    if (!projectId.value) {
        setNewProject()
    }

    if (projectId.value) {
        await setProject()
    }

    nextTick(() => {
        //       instance.tools.history.add('init')
    })
})
</script>

<template>
    <cd-instance class="h-dvh w-dvw" :height :width>
        <cd-tool-pan />
        <cd-tool-zoom />
        <cd-tool-brush />
        <cd-tool-eraser />

        <cd-gestures />

        <cd-ui-brush-settings />

        <cd-ui-toolbar class="absolute left-2 top-2 flex">
            <cd-btn padding="none" size="md" variant="text" to="/gallery">
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
