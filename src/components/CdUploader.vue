<script setup lang="ts">
import type File from '@/entities/File'

const props = defineProps<{
    multiple?: boolean
    accept?: string
}>()

const emit = defineEmits<{
    (event: 'uploaded', files: File[]): void
}>()

async function onClick() {
    const picked = await $file.pick({
        multiple: props.multiple,
        accept: props.accept,
    })

    const files = (Array.isArray(picked) ? picked : [picked]) as globalThis.File[]

    if (!files || files.length === 0) {
        return
    }

    const entities = await Promise.all(files.map($file.upload))

    if (entities.length === 0) {
        return
    }

    emit('uploaded', entities)
}

const activatorAttrs = {
    onClick,
}
</script>
<template>
    <slot name="activator" :attrs="activatorAttrs">
        <cd-btn color="primary" @click="onClick">
            <cd-icon name="heroicons:arrow-up-tray" class="mr-2" />
            Upload
        </cd-btn>
    </slot>
</template>
