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
    (e: 'send', message: Partial<any>): void
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

const content = ref('')

function submit() {
    emit('send', {
        type: 'text',
        content: content.value,
    })

    content.value = ''
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
    <div ref="scrollContainer" class="overflow-y-scroll">
        <div class="flex flex-col justify-end min-h-full">
            <div v-for="(m, idx) in innerMessages" :key="idx" class="px-5 py-2">
                <cd-card class="bg-body-600">
                    <cd-card-head class="border-b border-body-200 mb-2">
                        <div class="flex-1 flex gap-x-3 items-center">
                            <cd-avatar class="size-8">
                                <cd-icon name="heroicons:user-solid" />
                            </cd-avatar>
                            <div class="flex flex-col">
                                <cd-card-title class="text-sm">{{ m.title }}</cd-card-title>
                                <cd-card-subtitle class="md:text-xs">
                                    {{ m.subtitle }}
                                </cd-card-subtitle>
                            </div>
                        </div>
                        <slot name="message-actions" :message="m" />
                    </cd-card-head>
                    <cd-card-content>{{ m.content }}</cd-card-content>
                </cd-card>
            </div>
            <div class="px-5 py-5 shrink-0">
                <cd-card class="px-4 py-5 border-0">
                    <cd-form class="flex gap-2 items-center" @submit="submit">
                        <cd-text-field
                            v-model="content"
                            type="text"
                            :placeholder="sending ? $t('Sending...') : $t('Type a message')"
                            autocomplete="off"
                            :readonly="sending"
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
                </cd-card>
            </div>
        </div>
    </div>
</template>
