<script setup lang="ts">
import { get } from 'lodash-es'
const props = defineProps({
    messages: {
        type: Array as () => any[],
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

// textbox
const textarea = ref<HTMLTextAreaElement | null>(null)
const height = ref(26)

watch(
    content,
    () => {
        if (!content.value) {
            height.value = 26
            return
        }
    },
    { immediate: true }
)

defineExpose({
    scrollToBottom,
})
</script>

<template>
    <div class="relative">
        <div
            ref="scrollContainer"
            class="overflow-y-scroll scrollbar-invisible h-full"
            :style="{
                paddingBottom: '78px',
            }"
        >
            <div class="flex flex-col justify-end min-h-full">
                <template v-for="(m, idx) in messages" :key="idx">
                    <slot name="message" :message="m">
                        <div>
                            <div class="flex hover:bg-body-600 px-4 py-4 items-center gap-x-4">
                                <pre
                                    class="text-body-0 whitespace-pre-wrap break-words"
                                    v-text="getKeyValue(m, contentKey)"
                                ></pre>
                            </div>
                        </div>
                    </slot>
                </template>
            </div>
        </div>
        <div
            class="px-5 py-4 shrink-0 border-t-2 border-body-600 bg-body-700 absolute bottom-0 left-0 right-0"
        >
            <cd-form class="flex items-center" @submit="submit">
                <textarea
                    ref="textarea"
                    v-model="content"
                    :placeholder="$t('Type a message')"
                    :readonly="sending"
                    :style="{ height: `${height}px` }"
                    autocomplete="off"
                    class="flex-1 bg-transparent text-body-0 placeholder:text-body-100 focus:outline-none resize-none"
                    :class="sending ? 'opacity-50' : ''"
                    @keydown.exact.enter="submit"
                    @keydown.shift.enter="height += 26"
                ></textarea>

                <div class="flex gap-x-2">
                    <cd-menu placement="top-end" :offset="6">
                        <template #activator="{ attrs }">
                            <cd-btn
                                :disabled="sending"
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

                    <cd-btn type="submit" :loading="sending" size="sq-md">
                        <cd-icon name="heroicons:paper-airplane-solid" />
                    </cd-btn>
                </div>
            </cd-form>
        </div>
    </div>
</template>
