<script setup lang="ts">
import ThreadItem from '@/entities/ThreadItem'
import ThreadItemRepository from '@/facades/ThreadItemRepository'
import { watchDebounced } from '@vueuse/core'

const item = defineModel<ThreadItem>({
    required: true,
})

async function save() {
    await ThreadItemRepository.update(item.value.id, {
        data: {
            content: item.value.data.content,
        },
    })
}

watchDebounced(() => item.value.data.content, save, { debounce: 1000 })
</script>

<template>
    <cd-textarea-resizable v-model="item.data.content"></cd-textarea-resizable>
</template>
