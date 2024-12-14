<script setup lang="ts">
import type { Layer } from '@/composables/useInstance'
const instance = useInstance()
const route = useRoute()

const width = route.query.width ? Number(route.query.width) : 500
const height = route.query.height ? Number(route.query.height) : 500

onMounted(() => {
    const bgLayer: Layer = {
        id: createId(),
        name: 'Background',
        order: 1,
        type: 'paint',
        width: width,
        height: height,
        data: new OffscreenCanvas(width, height),
    }

    const paintLayer: Layer = {
        id: createId(),
        name: 'Paint',
        order: 2,
        type: 'paint',
        width: width,
        height: height,
        data: new OffscreenCanvas(width, height),
    }

    const ctx = bgLayer.data.getContext('2d')!

    ctx.fillStyle = 'white'

    ctx.fillRect(0, 0, width, height)

    instance.setLayers([bgLayer, paintLayer])
    instance.setActiveLayer(paintLayer.id)
    instance.setVisibleLayers([bgLayer.id, paintLayer.id])

    instance.tools.zoomAndPan.fit()
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

            <cd-ui-save />
        </cd-ui-toolbar>

        <cd-ui-toolbar class="absolute right-2 top-2">
            <cd-ui-tool-eraser />
            <cd-ui-tool-brush />
            <cd-ui-layer-list />
            <cd-ui-color-picker />
        </cd-ui-toolbar>

        <cd-layer-list />
    </cd-instance>
</template>
