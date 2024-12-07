<script setup lang="ts">
const instance = useInstance()

const keys = useMagicKeys()

const ctrlSpace = keys['Ctrl+Space']

const isPannig = ref(false)

let lastMouseX = 0

function onDown(event: PointerEvent) {
    isPannig.value = true
    lastMouseX = event.clientX
}

function onMove(event: PointerEvent) {
    if (!isPannig.value) return

    const shouldInscrease = event.clientX > lastMouseX
    const isPen = event.pointerType === 'pen'

    const factor = isPen ? 0.05 : 0.01
    const zoomDelta = shouldInscrease ? 1 : -1
    let newScale = instance.scale + zoomDelta * factor

    newScale = Math.max(0.1, newScale)
    newScale = Math.min(5, newScale)

    instance.setScale(newScale)

    lastMouseX = event.clientX
}

function onUp() {
    isPannig.value = false
}
</script>

<template>
    <div
        v-if="ctrlSpace"
        class="absolute inset-0 z-20 size-full cursor-zoom-in"
        @touchmove.prevent
        @pointerdown.prevent="onDown"
        @pointermove.prevent="onMove"
        @pointerup.prevent="onUp"
    />
</template>
