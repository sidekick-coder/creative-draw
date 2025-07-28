<script setup lang="ts">
import File from '@/entities/File'
import IndexDbDriveGateway from '@/gateways/IndexDbDriveGateway'

const dialog = defineModel('dialog', {
    type: Boolean,
    default: false,
})

const src = defineProp<string>('src', {
    type: String,
    required: true,
})

const alt = defineProp<string>('alt', {
    type: String,
    default: '',
})

const drive = new IndexDbDriveGateway()

const innerSrc = ref<string>()

async function load() {
    if (src.value.startsWith('drive:')) {
        const filename = src.value.replace('drive:', '')

        const uint8 = await drive.read(filename)

        if (uint8) {
            const base64 = await $uint8.toBase64(uint8)
            innerSrc.value = `data:${File.mime(filename)};base64,${base64}`
        }

        return
    }

    innerSrc.value = src.value
}

watch(src, load, { immediate: true })
</script>
<template>
    <img
        v-if="innerSrc"
        :src="innerSrc"
        :alt="alt"
        class="w-full h-full object-cover rounded-md"
        @click="dialog = true"
    />

    <cd-dialog v-model="dialog">
        <img
            v-if="innerSrc"
            :src="innerSrc"
            :alt="alt"
            class="w-full h-full object-cover rounded-md"
        />
    </cd-dialog>
</template>
