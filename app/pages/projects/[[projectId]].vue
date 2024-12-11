<script setup lang="ts">
import type { Layer } from '@/composables/useInstance'
const instance = useInstance()

const width = 500
const height = 500

const x = typeof window === 'undefined' ? 0 : window.innerWidth / 2 - width / 2
const y = typeof window === 'undefined' ? 0 : window.innerHeight / 2 - height / 2

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

    instance.addArtboard({
        id: createId(),
        name: 'Artboard',
        width,
        height,
        x,
        y,
        activeLayerId: paintLayer.id,
        layers: [paintLayer, bgLayer],
        visibleLayers: [paintLayer.id, bgLayer.id],
    })
})
</script>

<template>
    <cd-instance class="h-dvh w-dvw">
        <cd-tool-position />
        <cd-tool-zoom />
        <cd-tool-brush />

        <cd-ui-brush-settings />

        <cd-ui-toolbar class="absolute right-2 top-2">
            <cd-menu :close-on-content-click="false">
                <template #activator="{ attrs }">
                    <cd-btn v-bind="attrs" variant="text" padding="none" size="md">
                        <cd-icon name="heroicons:paint-brush-solid" />
                    </cd-btn>
                </template>

                <div class="p-2">
                    <cd-ui-brush-library />
                </div>
            </cd-menu>

            <cd-menu :close-on-content-click="false">
                <template #activator="{ attrs }">
                    <cd-btn v-bind="attrs" variant="text" padding="none" size="md">
                        <cd-icon name="heroicons:square-2-stack-solid" />
                    </cd-btn>
                </template>

                <div class="p-2">
                    <cd-ui-layer-list />
                </div>
            </cd-menu>
        </cd-ui-toolbar>

        <cd-artboard v-for="a in instance.artboards" :key="a.id" :model-value="a" />
    </cd-instance>
</template>
