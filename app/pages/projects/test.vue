<script setup lang="ts">
const instance = useInstance()

const width = 500
const height = 500

const x = typeof window === 'undefined' ? 0 : window.innerWidth / 2 - width / 2
const y = typeof window === 'undefined' ? 0 : window.innerHeight / 2 - height / 2

instance.addArtboard({
    id: createId(),
    name: 'Artboard',
    width,
    height,
    x,
    y,
    layers: [
        {
            id: createId(),
            name: 'Paint',
            order: 2,
            type: 'paint',
            width: width,
            height: height,
            data: new Uint8Array(width * height * 4),
        },
        {
            id: createId(),
            name: 'Background',
            order: 1,
            type: 'paint',
            width: width,
            height: height,
            data: new Uint8Array(width * height * 4).fill(255),
        },
    ],
})
</script>

<template>
    <cd-instance class="h-dvh w-dvw">
        <cd-tool-position />
        <cd-tool-zoom />
        <cd-artboard v-for="a in instance.artboards" :key="a.id" :model-value="a" />
    </cd-instance>
</template>
