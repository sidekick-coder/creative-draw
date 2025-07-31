<script setup lang="ts">
import type Thread from '@/entities/Thread'
import ThreadItem from '@/entities/ThreadItem'
import ThreadItemRepository from '@/facades/ThreadItemRepository'
import type AdapterRunnerGateway from '@/contracts/AdapterRunnerGateway'
import AdapterRunnerService from '@/services/AdapterRunnerService'

const thread = defineModel<Thread>('thread', {
    required: true,
})

const content = defineModel<string>('content', {
    type: String,
    default: '',
})

const items = defineModel<ThreadItem[]>('items', {
    default: () => [],
    required: true,
})

const loading = defineModel<boolean>('loading', {
    type: Boolean,
    default: false,
})

// generate image
const runners = ref<AdapterRunnerGateway[]>([])

async function loadRunners() {
    const [error, response] = await tryCatch(() => AdapterRunnerService.list())

    if (error) {
        console.error('Failed to load runners:', error)
        return
    }

    runners.value = response
}

onMounted(loadRunners)

async function addItem(type: string, data: any = {}) {
    const item = await ThreadItemRepository.create({
        type,
        threadId: thread.value.id,
        data,
    })

    items.value.push(item)
}

async function submit() {
    if (content.value.trim() === '') {
        return
    }

    loading.value = true

    await addItem('text', {
        content: content.value,
    })

    // Simulate loading the message
    setTimeout(() => {
        content.value = ''
        loading.value = false
    }, 1000)
}
</script>
<template>
    <div class="bg-body-700 flex px-4 py-2 items-center">
        <cd-tip-tap
            v-model="content"
            :class="loading ? 'opacity-50' : ''"
            class="flex-1 min-h-10 py-2"
            :shortcuts="{
                Enter: () => {
                    submit()
                    return true
                },
            }"
        >
            <cd-tip-tap-mention-extension
                trigger="@"
                :items="runners"
                value-key="id"
                label-key="name"
            >
                <template #item="{ item }">
                    <div class="flex flex-col gap-x-2">
                        <span> @{{ item.name }}</span>
                        <span class="text-sm text-body-100">{{ item.adapter.name }}</span>
                    </div>
                </template>
            </cd-tip-tap-mention-extension>
        </cd-tip-tap>

        <div class="flex gap-x-2 items-center">
            <cd-menu placement="top-end" :offset="6">
                <template #activator="{ attrs }">
                    <cd-btn
                        :disabled="loading"
                        color="secondary"
                        type="button"
                        size="sq-md"
                        v-bind="attrs"
                    >
                        <cd-icon name="heroicons:plus" />
                    </cd-btn>
                </template>
                <cd-card class="w-52 bg-body-500 border-body-100">
                    <slot name="textbox-actions" />
                </cd-card>
            </cd-menu>

            <cd-btn type="submit" :loading="loading" size="sq-md">
                <cd-icon name="heroicons:paper-airplane-solid" />
            </cd-btn>
        </div>
    </div>
</template>
