<script setup lang="ts">
import { useFloating } from '@floating-ui/vue'

defineOptions({
    inheritAttrs: false,
})

// initial position
const initialX = defineProp<number>('x', {
    type: Number,
    default: 100,
})

const initialY = defineProp<number>('y', {
    type: Number,
    default: 100,
})

const posX = ref(initialX.value)
const posY = ref(initialY.value)

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

    posX.value = startPosX + (e.clientX - startClientX)
    posY.value = startPosY + (e.clientY - startClientY)

    update()
}

function onPointerUp() {
    isDragging.value = false
}
</script>

<template>
    <div
        ref="floatingRef"
        :style="floatingStyles"
        class="z-50"
        :class="isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
    >
        <cd-card>
            <slot />
        </cd-card>
    </div>
</template>
