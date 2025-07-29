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

const dragIndex = ref<number | null>(null)
const dropIndex = ref<number | null>(null)

function onDragStart(index: number) {
    dragIndex.value = index
}

function onDragOver(index: number) {
    dropIndex.value = index
}

async function onDrop() {
    if (dragIndex.value === null || dropIndex.value === null) {
        dragIndex.value = null
        dropIndex.value = null
        return
    }
    const files = item.value.data.files
    const dragged = files[dragIndex.value]
    files.splice(dragIndex.value, 1)
    files.splice(dropIndex.value, 0, dragged)
    dragIndex.value = null
    dropIndex.value = null
    await save()
}

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
    item.value.data.files = item.value.data.files.filter((f: File) => f.id !== file.id)

    await save()
}
</script>

<template>
    <div class="flex gap-4 flex-wrap">
        <div
            v-for="(i, idx) in images"
            :key="i.id"
            class="relative size-40 cursor-pointer group/image"
            draggable="true"
            @dragstart="onDragStart(idx)"
            @dragover.prevent="onDragOver(idx)"
            @drop.prevent="onDrop"
        >
            <cd-img
                :src="`drive:${i.filename}`"
                alt="Generated image"
                class="size-full border-2 border-body-600"
            />
            <cd-btn
                class="absolute bottom-2 right-2 opacity-0 group-hover/image:opacity-100 transition-opacity"
                size="sq-sm"
                color="danger"
                @click="remove(i)"
            >
                <cd-icon name="heroicons:trash" />
            </cd-btn>
        </div>
        <cd-uploader accept="image/*" multiple @result="add">
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
