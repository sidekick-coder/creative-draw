<script setup lang="ts">
import type File from '@/entities/File'
import ThreadItem from '@/entities/ThreadItem'
import ThreadItemRepository from '@/facades/ThreadItemRepository'

const item = defineModel<ThreadItem>({
    required: true,
})

async function save(file: File | null) {
    await ThreadItemRepository.update(item.value.id, {
        data: { file },
    })

    item.value.data.file = file
}
</script>

<template>
    <div class="flex">
        <div v-if="item.data.file" class="relative w-auto">
            <cd-img
                :src="`drive:${item.data.file.filename}`"
                class="w-auto h-40 object-contain"
                alt="Generated image"
            />

            <cd-btn
                class="absolute bottom-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity"
                size="sq-sm"
                color="danger"
                @click="save(null)"
            >
                <cd-icon name="heroicons:trash" />
            </cd-btn>
        </div>

        <cd-uploader v-else accept="image/*" @uploaded="save($event[0])">
            <template #activator="{ attrs }">
                <cd-btn color="body-700" v-bind="attrs" class="flex flex-col">
                    <cd-icon
                        name="heroicons:photo"
                        class="size-20 object-contain text-body-400"
                        alt="No image available"
                    />
                </cd-btn>
            </template>
        </cd-uploader>
    </div>
</template>
