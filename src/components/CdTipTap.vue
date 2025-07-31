<script setup lang="ts">
import { useEditor, EditorContent, Editor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Extension } from '@tiptap/core'
import type { KeyboardShortcutCommand } from '@tiptap/core'
import { until } from '@vueuse/core'

defineOptions({
    inheritAttrs: false,
})

const props = defineProps({
    shortcuts: {
        type: Object as PropType<Record<string, KeyboardShortcutCommand>>,
        default: () => ({}),
    },
})

const DisableEnter = Extension.create({
    addKeyboardShortcuts() {
        return props.shortcuts
    },
})

const model = defineModel({
    type: String,
    default: '',
})

// editor
const extensions = ref([StarterKit, DisableEnter])
const editor = shallowRef<Editor>()

provide('extensions', extensions)
provide('editor', editor)

function onModelChange(value: string) {
    if (!editor.value) {
        return
    }
    if (value === editor.value.getHTML()) {
        return
    }

    editor.value.commands.setContent(value)
}

function load() {
    editor.value = new Editor({
        content: model.value,
        extensions: extensions.value,
        editorProps: {
            attributes: {
                class: 'focus:outline-0 min-h-full',
            },
        },
        onUpdate: ({ editor }) => {
            model.value = editor.getHTML()
        },
    })
}

watch(model, onModelChange, { immediate: true })

onMounted(() => {
    load()
})

onBeforeUnmount(() => {
    if (editor.value) {
        editor.value.destroy()
    }
})

// extensions
</script>

<template>
    <editor-content :editor="editor" v-bind="$attrs" />
    <slot />
</template>
