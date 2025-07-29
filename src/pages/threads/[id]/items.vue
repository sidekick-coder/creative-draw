<script setup lang="ts">
import CdChat from '@/components/CdChat.vue'
import type { Instruction } from '@/contracts/AdapterRunnerGateway'
import type AdapterRunnerGateway from '@/contracts/AdapterRunnerGateway'
import type ThreadItem from '@/entities/ThreadItem'
import ThreadItemRepository from '@/facades/ThreadItemRepository'
import { $t } from '@/globals/lang'
import IndexDbThreadItemRepository from '@/repositories/IndexDBThreadItemRepository'
import AdapterRunnerService from '@/services/AdapterRunnerService'

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
const chat = ref<InstanceType<typeof CdChat> | null>(null)

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
        type: 'text',
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

    load()

    setTimeout(() => {
        saving.value = false
        content.value = ''
        nextTick(() => chat.value?.scrollToBottom())
    }, 1000)
}

// generate image
const dialog = ref(false)
const generating = ref(false)
const runners = ref<AdapterRunnerGateway[]>([])
const payload = ref({
    prompt: '',
    runnerId: '',
})

async function loadRunners() {
    const [error, response] = await tryCatch(() => AdapterRunnerService.list())

    if (error) {
        console.error('Failed to load runners:', error)
        return
    }

    runners.value = response
}

async function generate() {
    const runner = runners.value.find((r) => r.id === payload.value.runnerId)

    if (!runner) {
        console.error('Runner not found')
        return
    }

    generating.value = true

    const instructions: Instruction[] = []

    for (const item of items.value) {
        if (item.type === 'image') {
            instructions.push({
                type: 'image',
                data: item.data.file,
            })
            continue
        }

        instructions.push({
            type: 'text',
            data: item.data.content,
        })
    }

    instructions.push({
        type: 'text',
        data: payload.value.prompt,
    })

    const [error, result] = await tryCatch(() => runner.run({ instructions }))

    if (error) {
        console.error('Failed to generate image:', error)
        generating.value = false
        return
    }

    for await (const item of result) {
        if (item.type === 'file') {
            await ThreadItemRepository.create({
                type: 'image',
                threadId: id.value,
                data: {
                    file: item.data,
                },
            })
            continue
        }

        await ThreadItemRepository.create({
            type: 'text',
            threadId: id.value,
            data: {
                content: item.data,
            },
        })
    }

    await load()

    setTimeout(() => {
        generating.value = false
        dialog.value = false
        content.value = ''
        nextTick(() => chat.value?.scrollToBottom())
    }, 1000)
}

onMounted(loadRunners)
</script>
<template>
    <app-layout>
        <cd-chat
            ref="chat"
            v-model:content="content"
            :messages="items"
            :sending="saving"
            class="h-dvh"
            content-key="data.content"
            @send="onSend"
        >
            <template #message="{ message, index }">
                <div
                    class="group/message flex hover:bg-body-600 px-4 py-4 items-center gap-x-4 border-b border-body-700 last:border-b-0"
                >
                    <div class="flex-1">
                        <cd-thread-item-text
                            v-if="message.type === 'text'"
                            v-model="items[index]"
                        />

                        <div v-else-if="message.type === 'image'" class="flex justify-start">
                            <cd-img
                                :src="`drive:${message.data.file.filename}`"
                                class="w-auto h-40 object-contain"
                                alt="Generated image"
                            />
                        </div>
                    </div>
                    <div class="self-start">
                        <cd-menu placement="bottom-end">
                            <template #activator="{ attrs }">
                                <cd-btn
                                    size="sq-sm"
                                    color="body-700"
                                    v-bind="attrs"
                                    class="opacity-0 group-hover/message:opacity-100 transition-opacity"
                                >
                                    <cd-icon name="heroicons:ellipsis-vertical-16-solid" />
                                </cd-btn>
                            </template>
                            <cd-card class="w-48">
                                <cd-list-item
                                    size="sq-sm"
                                    color="danger"
                                    @click="destroy(message.raw)"
                                >
                                    <cd-icon name="mdi:delete" />
                                    <div>{{ $t('Delete') }}</div>
                                </cd-list-item>
                            </cd-card>
                        </cd-menu>
                    </div>
                </div>
            </template>

            <template #textbox-actions>
                <cd-list-item color="secondary" variant="text" @click="dialog = true">
                    <cd-icon name="mdi:image" class="size-5" />
                    <div>{{ $t('[ai] image') }}</div>
                </cd-list-item>
            </template>
        </cd-chat>

        <cd-dialog v-model="dialog">
            <cd-form @submit="generate">
                <cd-card>
                    <cd-card-head class="flex-col items-start">
                        <cd-card-title>{{ $t('Generate image') }}</cd-card-title>
                        <cd-card-subtitle>
                            {{ $t('This will generate an image based on the current context') }}
                        </cd-card-subtitle>
                    </cd-card-head>
                    <cd-card-content class="flex flex-col gap-y-4">
                        <cd-select
                            v-model="payload.runnerId"
                            :label="$t('Select a runner')"
                            :options="runners"
                            value-key="id"
                            label-key="name"
                        >
                            <template #selection="{ option }">
                                <div class="flex flex-col items-start">
                                    <div>{{ option.name }}</div>
                                    <div class="text-sm text-body-200">
                                        {{ `${$t('Adapter')}: ${option.adapter.name}` }}
                                    </div>
                                </div>
                            </template>
                            <template #option="{ option }">
                                <div>
                                    <div>{{ option.name }}</div>
                                    <div class="text-sm text-body-200">
                                        {{ `${$t('Adapter')}: ${option.adapter.name}` }}
                                    </div>
                                </div>
                            </template>
                        </cd-select>
                        <cd-textarea
                            v-model="payload.prompt"
                            :label="$t('Prompt')"
                            :placeholder="$t('Describe the image you want to generate')"
                            :rows="3"
                        />
                    </cd-card-content>
                    <cd-card-footer>
                        <cd-btn variant="tonal" @click="dialog = false">
                            {{ $t('Cancel') }}
                        </cd-btn>
                        <cd-btn color="primary" :loading="generating" type="submit">
                            {{ $t('Generate') }}
                        </cd-btn>
                    </cd-card-footer>
                </cd-card>
            </cd-form>
        </cd-dialog>
    </app-layout>
</template>
