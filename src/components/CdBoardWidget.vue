<script setup lang="ts">
import { useFloating } from '@floating-ui/vue'

defineOptions({
    inheritAttrs: false,
})

// initial position
const posX = defineModel<number>('x', { default: 100 })
const posY = defineModel<number>('y', { default: 100 })
const width = defineModel<number>('width', { default: 300 })
const height = defineModel<number>('height', { default: 400 })

const minWidth = defineProp<number>('minWidth', {
    type: Number,
    default: 200,
})

const maxWidth = defineProp<number>('maxWidth', {
    type: Number,
    default: Infinity,
})

const minHeight = defineProp<number>('minHeight', {
    type: Number,
    default: 100,
})

const maxHeight = defineProp<number>('maxHeight', {
    type: Number,
    default: Infinity,
})

// virtual reference element for floating-ui positioning
const virtualRef = computed(() => ({
    getBoundingClientRect() {
        return {
            x: posX.value,
            y: posY.value,
            width: 0,
            height: 0,
            top: posY.value,
            left: posX.value,
            right: posX.value,
            bottom: posY.value,
        }
    },
}))

const floatingRef = ref<HTMLElement | null>(null)

const { floatingStyles, update } = useFloating(virtualRef, floatingRef, {
    strategy: 'fixed',
    placement: 'bottom-start',
})

// drag logic
const isDragging = ref(false)

let startClientX = 0
let startClientY = 0
let startPosX = 0
let startPosY = 0

function onPointerDown(e: PointerEvent) {
    isDragging.value = true
    startClientX = e.clientX
    startClientY = e.clientY
    startPosX = posX.value
    startPosY = posY.value

    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)

    e.preventDefault()
}

function onPointerMove(e: PointerEvent) {
    if (!isDragging.value) return

    posX.value = Math.min(
        Math.max(0, startPosX + (e.clientX - startClientX)),
        window.innerWidth - width.value
    )
    posY.value = Math.min(
        Math.max(0, startPosY + (e.clientY - startClientY)),
        window.innerHeight - height.value
    )

    update()
}

function onPointerUp() {
    isDragging.value = false
}

// resize logic
const isResizing = ref(false)

let startResizeX = 0
let startResizeY = 0
let startWidth = 0
let startHeight = 0

function onResizePointerDown(e: PointerEvent) {
    isResizing.value = true
    startResizeX = e.clientX
    startResizeY = e.clientY
    startWidth = width.value
    startHeight = height.value

    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)

    e.preventDefault()
    e.stopPropagation()
}

function onResizePointerMove(e: PointerEvent) {
    if (!isResizing.value) return

    width.value = Math.min(
        Math.max(minWidth.value, startWidth + (e.clientX - startResizeX)),
        Math.min(maxWidth.value, window.innerWidth - posX.value)
    )
    height.value = Math.min(
        Math.max(minHeight.value, startHeight + (e.clientY - startResizeY)),
        Math.min(maxHeight.value, window.innerHeight - posY.value)
    )
}

function onResizePointerUp() {
    isResizing.value = false
}
</script>

<template>
    <div ref="floatingRef" :style="floatingStyles" class="z-50 group/widget">
        <div
            class="flex items-center justify-center py-1 rounded-t bg-body-700 opacity-0 group-hover/widget:opacity-100 transition-opacity"
            :class="isDragging ? 'cursor-grabbing select-none opacity-100' : 'cursor-grab'"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
        >
            <cd-icon name="heroicons:bars-2" class="text-body-200" />
        </div>
        <cd-card
            class="relative overflow-auto"
            :style="{ width: `${width}px`, height: `${height}px` }"
        >
            <slot />

            <div
                class="absolute bottom-0 right-0 size-4 cursor-se-resize opacity-0 group-hover/widget:opacity-100 transition-opacity flex items-center justify-center"
                :class="isResizing ? 'opacity-100' : ''"
                @pointerdown="onResizePointerDown"
                @pointermove="onResizePointerMove"
                @pointerup="onResizePointerUp"
            >
                <cd-icon name="heroicons:arrows-pointing-out" class="text-body-400 text-xs rotate-90" />
            </div>
        </cd-card>
    </div>
</template>
