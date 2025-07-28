<script setup lang="ts" generic="T">
import { get } from 'lodash-es'
const props = defineProps({
    messages: {
        type: Array as () => T[],
        required: true,
    },
    contentKey: {
        type: [String, Function],
        default: 'content',
    },
    titleKey: {
        type: [String, Function],
        default: 'title',
    },
    subtitleKey: {
        type: [String, Function],
        default: 'subtitle',
    },
    sending: {
        type: Boolean,
        default: false,
    },
})

const emit = defineEmits<{
    (e: 'send'): void
}>()

function getKeyValue<T>(item: T, key: string | Function) {
    if (typeof key === 'function') {
        return key(item)
    }

    return get(item, key, '')
}

const innerMessages = computed(() => {
    return props.messages.map((message) => ({
        raw: message,
        title: getKeyValue(message, props.titleKey),
        subtitle: getKeyValue(message, props.subtitleKey),
        content: getKeyValue(message, props.contentKey),
    }))
})

const content = defineModel<string>('content', {
    type: String,
    default: '',
})

function submit() {
    emit('send')
}

// scroll
const scrollContainer = ref<HTMLElement | null>(null)

function scrollToBottom() {
    if (scrollContainer.value) {
        nextTick(() => {
            scrollContainer.value!.scrollTo({
                top: scrollContainer.value!.scrollHeight,
                behavior: 'smooth',
            })
        })
    }
}

watch(() => props.messages.length, scrollToBottom, { immediate: true })

defineExpose({
    scrollToBottom,
})
</script>

<template>
    <div ref="scrollContainer" class="overflow-y-scroll scrollbar-invisible">
        <div class="flex flex-col justify-end min-h-full">
            <div v-for="(m, idx) in innerMessages" :key="idx">
                <div class="flex hover:bg-body-600 px-4 py-4 items-center gap-x-4">
                    <div class="flex-1">{{ m.content }}</div>
                    <div>
                        <cd-menu placement="bottom-end">
                            <template #activator="{ attrs }">
                                <cd-btn variant="text" size="sq-sm" v-bind="attrs">
                                    <cd-icon name="heroicons:ellipsis-vertical-16-solid" />
                                </cd-btn>
                            </template>
                            <cd-card class="w-48">
                                <slot name="message-actions" :message="m" />
                            </cd-card>
                        </cd-menu>
                    </div>
                </div>
            </div>
            <div class="px-5 py-4 shrink-0 border-t-2 border-body-600 bg-body-700">
                <cd-form class="flex gap-2 items-center" @submit="submit">
                    <input
                        v-model="content"
                        type="text"
                        :placeholder="$t('Type a message')"
                        autocomplete="off"
                        :disabled="sending"
                        class="flex-1 bg-transparent text-body-0 placeholder:text-body-100 focus:outline-none disabled:opacity-50"
                    />
                    <cd-btn
                        :disabled="sending"
                        variant="tonal"
                        type="button"
                        class="size-11"
                        size="none"
                    >
                        <cd-icon name="heroicons:paper-clip-solid" />
                    </cd-btn>
                    <cd-btn type="submit" :loading="sending" class="h-11">
                        <cd-icon name="heroicons:paper-airplane-solid" />
                    </cd-btn>
                </cd-form>
            </div>
        </div>
    </div>
</template>
