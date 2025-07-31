<script setup lang="ts">
import type { DocumentType } from '@tiptap/core'
import CdTipTap from '@/components/CdTipTap.vue'
import type Thread from '@/entities/Thread'
import ThreadItem from '@/entities/ThreadItem'
import ThreadItemRepository from '@/facades/ThreadItemRepository'
import type AdapterRunnerGateway from '@/contracts/AdapterRunnerGateway'
import AdapterRunnerService from '@/services/AdapterRunnerService'

const tiptapRef = ref<InstanceType<typeof CdTipTap>>()

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

function findTool(doc: any): { id: string; label: string; trigger: string } | null {
    if (!doc?.content) return null

    for (const node of doc.content) {
        if (node.type === 'mention') {
            return {
                id: node.attrs.id,
                label: node.attrs.label,
                trigger: node.attrs.mentionSuggestionChar,
            }
        }

        if (node.content) {
            const found = findTool(node)

            if (found) return found
        }
    }

    return null
}

function findText(doc: any): string {
    if (!doc?.content) return ''

    return doc.content
        .map((node: any) => {
            if (node.type === 'mention') {
                return '' // skip mentions
            }

            if (node.type === 'text') {
                return node.text
            }

            if (node.content) {
                return findText(node)
            }

            return ''
        })
        .join('')
}

async function executeTool(toolId: string, prompt: string) {
    const runner = runners.value.find((r) => r.id === toolId)

    if (!runner) {
        console.error('Runner not found for tool ID:', toolId)
        return
    }

    const instructions = items.value.map((i) => i.toInstruction()).flat()

    instructions.push({
        type: 'text',
        data: prompt,
    })

    const [error, result] = await tryCatch(() => runner.run({ instructions }))

    if (error) {
        console.error('Failed to generate image:', error)
        return
    }

    for await (const item of result) {
        if (item.type === 'file') {
            await ThreadItemRepository.create({
                type: 'image',
                threadId: thread.value.id,
                data: {
                    file: item.data,
                },
            })
            continue
        }

        await ThreadItemRepository.create({
            type: 'text',
            threadId: thread.value.id,
            data: {
                content: item.data,
            },
        })
    }
}

async function submit() {
    if (content.value.trim() === '') {
        return
    }

    loading.value = true

    const json = tiptapRef.value?.toJSON()

    const tool = findTool(json)

    const [error] = await tryCatch(() => {
        if (tool) {
            return executeTool(tool.id, findText(json))
        }

        return addItem('text', {
            content: content.value,
        })
    })

    if (error) {
        console.error('Error executing tool or adding item:', error)
        loading.value = false
        return
    }

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
            ref="tiptapRef"
            v-model="content"
            class="flex-1 min-h-10 py-2"
            :class="loading ? 'opacity-50' : ''"
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
            <cd-btn :loading="loading" size="sq-md" @click="submit">
                <cd-icon name="heroicons:paper-airplane-solid" />
            </cd-btn>
        </div>
    </div>
</template>
