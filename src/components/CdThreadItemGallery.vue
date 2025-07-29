<script setup lang="ts">
import File from '@/entities/File'
import ThreadItem from '@/entities/ThreadItem'
import ThreadItemRepository from '@/facades/ThreadItemRepository'

const item = defineModel<ThreadItem>({
    required: true,
})

const images = computed(() => {
    if (!item.value.data.files) {
        return []
    }

    if (!Array.isArray(item.value.data.files)) {
        return []
    }

    return item.value.data.files.map((data) => new File(data))
})

async function save() {
    await ThreadItemRepository.update(item.value.id, {
        data: { files: item.value.data.files || [] },
    })
}

async function add(files: File[]) {
    if (!item.value.data.files) {
        item.value.data.files = []
    }

    item.value.data.files.push(...files)

    await save()
}

async function remove(file: File) {
    item.value.data.files = item.value.data.files.filter((f) => f.id !== file.id)

    await save()
}
</script>

<template>
    <div class="flex gap-4 flex-wrap">
        <div v-for="i in images" :key="i.id" class="relative size-40">
            <cd-img
                :src="`drive:${i.filename}`"
                alt="Generated image"
                class="size-full border-2 border-body-600"
            />

            <cd-btn
                class="absolute bottom-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity"
                size="sq-sm"
                color="danger"
                @click="remove(i)"
            >
                <cd-icon name="heroicons:trash" />
            </cd-btn>
        </div>

        <cd-uploader accept="image/*" multiple @uploaded="add">
            <template #activator="{ attrs }">
                <cd-btn
                    color="none"
                    size="none"
                    v-bind="attrs"
                    class="flex flex-col border-2 border-body-100 border-dashed size-40"
                    variant="outlined"
                >
                    <cd-icon
                        name="mdi:image-plus-outline"
                        class="size-14 object-contain text-body-100"
                        alt="No image available"
                    />
                </cd-btn>
            </template>
        </cd-uploader>
    </div>
</template>
