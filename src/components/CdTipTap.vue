<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { Extension } from '@tiptap/core'
import type { KeyboardShortcutCommand } from '@tiptap/core'

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

const editor = useEditor({
    content: model.value,
    extensions: [StarterKit, DisableEnter],
    editorProps: {
        attributes: {
            class: 'focus:outline-0 min-h-full',
        },
    },
    onUpdate: ({ editor }) => {
        model.value = editor.getHTML()
    },
})

function onModelChange(value: string) {
    if (!editor.value) {
        return
    }
    if (value === editor.value.getHTML()) {
        return
    }

    editor.value.commands.setContent(value)
}

watch(model, onModelChange, { immediate: true })

onBeforeUnmount(() => {
    if (editor.value) {
        editor.value.destroy()
    }
})
</script>

<template>
    <editor-content :editor="editor" class="focus:outline-0" />
</template>
