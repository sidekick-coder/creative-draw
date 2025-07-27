<script setup lang="ts">
import type Adapter from '@/entities/Adapter'
import IndexDbThreadRepository from '@/repositories/IndexDBThreadRepository'
import IndexDBThreadImageRepository from '@/repositories/IndexDBThreadImageRepository'
import IndexDBAdapterRepository from '@/repositories/IndexDBAdapterRepository'
import type RunnerGateway from '@/contracts/RunnerGateway'
import OpenAiRunner from '@/gateways/OpenAiRunner'
import type ThreadImage from '@/entities/ThreadImage'
import type Thread from '@/entities/Thread'
import IndexDbThreadItemRepository from '@/repositories/IndexDBThreadItemRepository'

// table
const imageRepository = new IndexDBThreadImageRepository()
const itemRepository = new IndexDbThreadItemRepository()
const loading = ref(false)
const items = ref<ThreadImage[]>([])
const columns = [
    {
        id: 'id',
        label: 'ID',
        class: 'w-24',
    },
    {
        id: 'image',
        label: 'Image',
        class: 'w-24',
        field: (item: ThreadImage) => {
            if (!item.src) {
                return null
            }

            if (item.src.startsWith('http')) {
                return item.src
            }

            return `data:image/webp;base64,${item.src}`
        },
    },
    {
        id: 'status',
        label: __('Status'),
        field: 'status',
    },
    {
        id: 'createdAt',
        label: __('Created At'),
        field: (item: ThreadImage) => $date.dateTime(item.createdAt),
    },
    {
        id: 'updatedAt',
        label: __('Updated At'),
        field: (item: ThreadImage) => $date.dateTime(item.updatedAt),
    },
    {
        id: 'actions',
    },
]

async function load() {
    loading.value = true

    const [error, response] = await tryCatch(() => imageRepository.list())

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

// threads
const threadRepository = new IndexDbThreadRepository()
const threads = ref<Thread[]>([])

async function loadThreads() {
    const [error, response] = await tryCatch(() => threadRepository.list())

    if (error) {
        console.error('Failed to load threads:', error)
        loading.value = false
        return
    }

    threads.value = response
}
onMounted(loadThreads)

// adapters
const adapterRepository = new IndexDBAdapterRepository()
const adapters = ref<Adapter[]>([])

async function loadAdapters() {
    const [error, response] = await tryCatch(() => adapterRepository.list())

    if (error) {
        console.error('Failed to load adapters:', error)
        loading.value = false
        return
    }

    adapters.value = response
}

onMounted(loadAdapters)

// actions
const dialog = ref(false)
const saving = ref(false)
const editedId = ref<string | null>(null)
const payload = ref({
    threadId: null,
    adapterId: null,
})

async function submit() {
    let runner: RunnerGateway | null = null

    const thread = threads.value.find((t) => t.id === payload.value.threadId)
    const adapter = adapters.value.find((a) => a.id === payload.value.adapterId)

    if (!thread || !adapter) {
        console.error('Thread or adapter not found')
        return
    }

    if (adapter.type === 'openai') {
        runner = new OpenAiRunner()
    }

    if (!runner) {
        console.error('Runner not found for adapter type:', adapter.type)
        return
    }

    const items = await itemRepository.list({
        filters: {
            threadId: thread.id,
        },
    })

    runner.imageRepository = imageRepository

    saving.value = true

    const [error] = await tryCatch(() =>
        runner.run({
            thread,
            adapter,
            items,
        })
    )

    if (error) {
        console.error(error)
        saving.value = false
        return
    }

    setTimeout(() => {
        dialog.value = false
        saving.value = false
        load()
    }, 1000)
}

async function deleteItem(item: ThreadImage) {
    const [error] = await tryCatch(() => imageRepository.destroy(item.id))

    if (error) {
        console.error('Failed to delete thread:', error)
        return
    }

    await load()
}

watch(dialog, (value) => {
    if (!value) {
        editedId.value = null
        payload.value = {
            threadId: null,
            adapterId: null,
        }
    }
})
</script>
<template>
    <app-layout>
        <div class="p-5 flex flex-col gap-y-5">
            <cd-card>
                <cd-card-head class="flex items-center">
                    <cd-card-title class="flex-1">
                        {{ $t('Images') }}
                    </cd-card-title>
                    <div class="flex items-center gap-x-2">
                        <cd-btn size="sq-md" :loading="loading" variant="tonal" @click="load">
                            <cd-icon name="mdi:refresh" />
                        </cd-btn>
                        <cd-btn color="primary" @click="dialog = true">
                            {{ $t('Add new') }}
                        </cd-btn>
                    </div>
                </cd-card-head>
            </cd-card>

            <cd-card>
                <cd-data-table :items :columns :total="items.length" :limit="10" :page="1">
                    <template #item-image="{ value }">
                        <img
                            v-if="value"
                            :src="value"
                            alt="Image"
                            class="size-16 object-cover rounded"
                        />

                        <cd-icon v-else name="mdi:image-off" class="size-16 text-gray-400" />
                    </template>

                    <template #item-actions="{ item }">
                        <div class="flex justify-end">
                            <cd-btn
                                color="danger"
                                size="sq-sm"
                                variant="text"
                                @click="deleteItem(item)"
                            >
                                <cd-icon name="mdi:delete" />
                            </cd-btn>
                        </div>
                    </template>
                </cd-data-table>
            </cd-card>

            <cd-dialog v-model="dialog">
                <cd-form @submit="submit">
                    <cd-card class="w-96">
                        <cd-card-head>
                            <cd-card-title>
                                {{ $t('Create image') }}
                            </cd-card-title>
                        </cd-card-head>
                        <cd-card-content class="flex flex-col gap-y-4">
                            <cd-select
                                v-model="payload.threadId"
                                :label="$t('Thread')"
                                :options="threads"
                                label-key="title"
                                value-key="id"
                                :rules="[$rules.required()]"
                            />
                            <cd-select
                                v-model="payload.adapterId"
                                :label="$t('Adapter')"
                                :options="adapters"
                                label-key="name"
                                value-key="id"
                                :rules="[$rules.required()]"
                            />
                        </cd-card-content>

                        <cd-card-footer>
                            <cd-btn :disabled="saving" color="danger" @click="dialog = false">
                                {{ $t('Cancel') }}
                            </cd-btn>
                            <cd-btn color="primary" :loading="saving" type="submit">
                                {{ $t('Submit') }}
                            </cd-btn>
                        </cd-card-footer>
                    </cd-card>
                </cd-form>
            </cd-dialog>
        </div>
    </app-layout>
</template>
