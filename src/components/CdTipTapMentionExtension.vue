<script setup lang="ts" generic="T">
import { computePosition, flip, shift } from '@floating-ui/dom'
import { posToDOMRect } from '@tiptap/vue-3'
import Mention from '@tiptap/extension-mention'
import { inject } from 'vue'

const props = defineProps({
    trigger: {
        type: String,
        default: '@',
    },
    items: {
        type: Array as () => T[],
        default: () => [],
    },
    labelKey: {
        type: String,
        default: 'name',
    },
    valueKey: {
        type: String,
        default: 'name',
    },
})

const contentRef = ref<HTMLElement>()
const open = ref(false)

const extensions = inject<any>('extensions', ref([]))
const editor = inject<any>('editor', ref(null))
let command: any

function findValue(item: any): string {
    if (props.valueKey && item[props.valueKey]) {
        return item[props.valueKey]
    }

    return item
}

function findLabel(item: any): string {
    if (props.labelKey && item[props.labelKey]) {
        return item[props.labelKey]
    }

    return item
}

// position
async function setPosition() {
    if (!editor.value || !contentRef.value) {
        return
    }

    const virtualElement = {
        getBoundingClientRect: () =>
            posToDOMRect(
                editor.value.view,
                editor.value.state.selection.from,
                editor.value.state.selection.to
            ),
    }

    const result = await computePosition(virtualElement, contentRef.value, {
        placement: 'top-start',
        middleware: [flip(), shift()],
    })

    contentRef.value.style.width = 'max-content'
    contentRef.value.style.position = 'fixed'
    contentRef.value.style.left = `${result.x}px`
    contentRef.value.style.top = `${result.y}px`
    contentRef.value.style.zIndex = '1000'
}

const extension = Mention.configure({
    HTMLAttributes: {
        class: 'bg-primary-300/25 text-primary-100 rounded px-1',
    },
    suggestion: {
        char: props.trigger,
        items: ({ query }) => {
            return props.items
                .filter((i) => findValue(i).toLowerCase().includes(query.toLowerCase()))
                .slice(0, 5)
        },
        render() {
            return {
                onStart: (args) => {
                    command = args.command

                    setPosition()

                    open.value = true
                },
                onUpdate: () => {
                    setPosition()
                },
                onExit: () => {
                    open.value = false
                },
            }
        },
    },
})

onBeforeMount(() => {
    extensions.value.push(extension)
})

// actions

function selectItem(item: any) {
    if (!editor.value) {
        return
    }

    const value = findValue(item)
    command({ id: value, label: findLabel(item) })
    open.value = false
}
</script>
<template>
    <teleport to="body">
        <div v-show="open" ref="contentRef" class="fixed">
            <cd-card class="bg-body-700 shadow-lg max-w-xs">
                <cd-list-item v-for="(item, index) in items" :key="index" @click="selectItem(item)">
                    <slot name="item" :item="item"> @{{ findLabel(item) }} </slot>
                </cd-list-item>
            </cd-card>
        </div>
    </teleport>
</template>
