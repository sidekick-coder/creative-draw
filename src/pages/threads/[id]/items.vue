<script setup lang="ts">
import type Thread from '@/entities/Thread'
import type ThreadItem from '@/entities/ThreadItem'
import ThreadItemRepository from '@/facades/ThreadItemRepository'
import ThreadRepository from '@/facades/ThreadRepository'
import { $t } from '@/globals/lang'

// general
const route = useRoute('/threads/[id]/items')

const id = computed(() => route.params.id)

// thread
const thread = ref<Thread>()

async function loadThread() {
    const [error, response] = await tryCatch(() => ThreadRepository.find(id.value))

    if (error || !response) {
        console.error('Failed to load thread:', error)
        return
    }

    thread.value = response
}

watch(id, loadThread, { immediate: true })

// items
const loading = ref(false)
const items = ref<ThreadItem[]>([])

async function load() {
    loading.value = true

    const [error, response] = await tryCatch(() =>
        ThreadItemRepository.list({
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

async function destroy(item: ThreadItem) {
    const [error] = await tryCatch(() => ThreadItemRepository.destroy(item.id))

    if (error) {
        console.error('Failed to delete thread:', error)
        return
    }

    await load()
}
</script>
<template>
    <app-layout v-if="thread">
        <div class="overflow-y-scroll h-[calc(100vh-56px)]">
            <div
                v-for="(i, index) in items"
                :key="i.id"
                class="group/item flex px-4 py-4 items-center gap-x-4 border-b border-body-700 last:border-b-0"
            >
                <div class="text-body-200 shrink-0 w-4 text-center self-start dragger">
                    {{ index + 1 }}
                </div>
                <div class="flex-1">
                    <ai-thread-item-text v-if="i.type === 'text'" v-model="items[index]" />

                    <ai-thread-item-image v-else-if="i.type === 'image'" v-model="items[index]" />

                    <ai-thread-item-gallery
                        v-else-if="i.type === 'gallery'"
                        v-model="items[index]"
                    />

                    <div v-else class="text-danger-500">
                        {{ $t('Unknown item type') }}: {{ i.type }}
                    </div>
                </div>
                <div class="self-start">
                    <cd-btn
                        size="sq-sm"
                        color="danger"
                        class="opacity-0 group-hover/item:opacity-100 transition-opacity"
                        @click="destroy(i)"
                    >
                        <cd-icon name="heroicons:trash-16-solid" />
                    </cd-btn>
                </div>
            </div>
        </div>

        <ai-thread-textarea v-model:items="items" v-model:thread="thread" />
    </app-layout>
</template>
