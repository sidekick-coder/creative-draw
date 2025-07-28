<script setup lang="ts">
import type ThreadItem from '@/entities/ThreadItem'
import { $t } from '@/globals/lang'
import IndexDbThreadItemRepository from '@/repositories/IndexDBThreadItemRepository'

// general
const repository = new IndexDbThreadItemRepository()
const route = useRoute('/threads/[id]/items')

const id = computed(() => route.params.id)

// items
const loading = ref(false)
const items = ref<ThreadItem[]>([])

async function load() {
    loading.value = true

    const [error, response] = await tryCatch(() =>
        repository.list({
            filters: {
                threadId: id.value,
            },
        })
    )

    if (error) {
        console.error('Failed to load threads:', error)
        loading.value = false
        return
    }

    items.value = response

    setTimeout(() => {
        loading.value = false
    }, 1000)
}

onMounted(load)

// actions
const saving = ref(false)
const content = ref('')

async function destroy(item: ThreadItem) {
    const [error] = await tryCatch(() => repository.destroy(item.id))

    if (error) {
        console.error('Failed to delete thread:', error)
        return
    }

    await load()
}

async function onSend() {
    saving.value = true

    const data = {
        type: 'test',
        threadId: id.value,
        data: {
            content: content.value,
            from: $t('me'),
            to: $t('user'),
        },
    }

    const [error] = await tryCatch(() => repository.create(data))

    if (error) {
        console.error('Failed to send message:', error)
        saving.value = false
        return
    }

    setTimeout(() => {
        saving.value = false
        content.value = ''
        load()
    }, 1000)
}
</script>
<template>
    <thread-layout>
        <cd-chat
            v-model:content="content"
            :messages="items"
            :sending="saving"
            class="h-dvh"
            content-key="data.content"
            :title-key="() => $t('me')"
            :subtitle-key="() => $t('user')"
            @send="onSend"
        >
            <template #message-actions="{ message }">
                <cd-list-item
                    size="sq-sm"
                    color="primary"
                    variant="text"
                    @click="destroy(message.raw)"
                >
                    <cd-icon name="mdi:pen" />
                    <div>{{ $t('Edit') }}</div>
                </cd-list-item>
                <cd-list-item size="sq-sm" color="danger" @click="destroy(message.raw)">
                    <cd-icon name="mdi:delete" />
                    <div>{{ $t('Delete') }}</div>
                </cd-list-item>
            </template>
        </cd-chat>
    </thread-layout>
</template>
