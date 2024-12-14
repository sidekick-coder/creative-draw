<script setup lang="ts">
const instance = useInstance()

const menu = ref(false)
const saving = ref(false)

async function saveFSA() {}
async function saveImage(format: 'png' | 'jpeg') {
    saving.value = true

    const canvas = new OffscreenCanvas(instance.width, instance.height)
    const ctx = canvas.getContext('2d')!

    const layers = instance.layers
        .slice()
        .reverse()
        .filter((layer) => instance.visibleLayers.includes(layer.id))

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
</script>

<template>
    <cd-menu v-model="menu">
        <template #activator="{ attrs }">
            <cd-btn v-bind="attrs" variant="text" padding="none" size="md" :loading="saving">
                <cd-icon name="mdi:content-save" />
            </cd-btn>
        </template>

        <div class="p-2">
            <cd-card>
                <cd-list-item @click="saveFSA">
                    <cd-icon name="heroicons:folder-solid" />

                    <div>Project</div>
                </cd-list-item>

                <cd-list-item @click="saveImage('png')">
                    <cd-icon name="mdi:image" />

                    <div>PNG</div>
                </cd-list-item>

                <cd-list-item @click="saveImage('jpeg')">
                    <cd-icon name="mdi:image" />

                    <div>JPEG</div>
                </cd-list-item>
            </cd-card>
        </div>
    </cd-menu>
</template>
