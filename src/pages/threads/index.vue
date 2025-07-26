<script setup lang="ts">
import type Thread from '@/entities/Thread'
import IndexDbThreadRepository from '@/repositories/IndexDBThreadRepository'

const repository = new IndexDbThreadRepository()

const items = ref<Thread[]>([])
const columns = [
    { id: 'id', label: 'ID' },
    { id: 'title', label: 'Title', field: 'title' },
    {
        id: 'content',
        label: 'Content',
        field: (item: Thread) => item.content.slice(0, 50) + '...',
    },
    {
        id: 'createdAt',
        label: 'Created At',
        field: (item: Thread) => item.createdAt.toLocaleString(),
    },
]

async function load() {
    const [error, response] = await tryCatch(() => repository.list())

    if (error) {
        console.error('Failed to load threads:', error)
        return
    }

    items.value = response
}

onMounted(load)
</script>
<template>
    <app-layout>
        <div class="p-5">
            <cd-card variant="outlined">
                <cd-data-table :items :columns :total="items.length" :limit="10" :page="1" />
            </cd-card>
        </div>
    </app-layout>
</template>
