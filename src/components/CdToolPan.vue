<script setup lang="ts">
const instance = useInstance()

const { space } = useMagicKeys()

const isPannig = ref(false)

let lastMouseX = 0
let lastMouseY = 0

function onDown(event: MouseEvent) {
    event.preventDefault()

    isPannig.value = true
    lastMouseX = event.clientX
    lastMouseY = event.clientY
}

function onMove(event: MouseEvent) {
    if (!isPannig.value) return

    const position = instance.tools.zoomAndPan.position

    const x = position.x + event.clientX - lastMouseX
    const y = position.y + event.clientY - lastMouseY

    instance.tools.zoomAndPan.setPosition({ x, y })

    lastMouseX = event.clientX
    lastMouseY = event.clientY
}

function onUp() {
    isPannig.value = false
}
</script>

<template>
    <div
        v-if="space"
        class="absolute inset-0 z-20 size-full"
        :class="[isPannig ? 'cursor-grabbing' : 'cursor-grab']"
        @touchmove.prevent
        @pointerdown.prevent="onDown"
        @pointermove.prevent="onMove"
        @pointerup.prevent="onUp"
    />
</template>
