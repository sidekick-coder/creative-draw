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
    const newScale = instance.tools.zoomAndPan.scale + zoomDelta * factor

    instance.tools.zoomAndPan.setScale(newScale)

    lastMouseX = event.clientX
}

function onWheel(event: WheelEvent) {
    event.preventDefault()

    const factor = 0.1
    const zoomDelta = event.deltaY < 0 ? 1 : -1
    let newScale = instance.tools.zoomAndPan.scale + zoomDelta * factor

    newScale = Math.max(0.1, newScale)
    newScale = Math.min(5, newScale)

    instance.tools.zoomAndPan.setScale(newScale)
}

function onUp() {
    isPannig.value = false
}

// gesture
const isGesturePanning = ref(false)

const pinch = ref({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    distance: 0,
    initialOffsetX: 0,
    initialOffsetY: 0,
})

function findDistance({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
    return Math.hypot(x2 - x1, y2 - y1)
}

function findMidpoint({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
    return {
        x: x1 + (x2 - x1) / 2,
        y: y1 + (y2 - y1) / 2,
    }
}

onInstanceEvent('container:touchstart', ({ event }) => {
    if (event.touches.length === 4) {
        event.preventDefault()
        event.stopPropagation()
        instance.tools.zoomAndPan.fit()
        return
    }

    if (event.touches.length !== 2) return

    event.preventDefault()
    event.stopPropagation()

    const touch1 = event.touches[0]
    const touch2 = event.touches[1]

    if (!touch1 || !touch2) return

    isGesturePanning.value = true

    pinch.value.x1 = touch1.clientX
    pinch.value.y1 = touch1.clientY

    pinch.value.x2 = touch2.clientX
    pinch.value.y2 = touch2.clientY

    pinch.value.distance = findDistance(pinch.value)

    pinch.value.initialOffsetX = instance.tools.zoomAndPan.position.x
    pinch.value.initialOffsetY = instance.tools.zoomAndPan.position.y
})

// pinch to zoom
onInstanceEvent('container:touchmove', ({ event }) => {
    if (!isGesturePanning.value) return

    if (event.touches.length !== 2) return

    const touch1 = event.touches[0]
    const touch2 = event.touches[1]

    if (!touch1 || !touch2) return

    const distance = findDistance({
        x1: touch1.clientX,
        y1: touch1.clientY,
        x2: touch2.clientX,
        y2: touch2.clientY,
    })

    const diff = Math.abs(pinch.value.distance - distance)

    if (diff > 100) {
        const factor = 0.01
        const zoomDelta = distance > pinch.value.distance ? 1 : -1
        const newScale = instance.tools.zoomAndPan.scale + zoomDelta * factor

        instance.tools.zoomAndPan.setScale(newScale)
    }

    let x = instance.tools.zoomAndPan.position.x
    let y = instance.tools.zoomAndPan.position.y

    const middle1 = findMidpoint({
        x1: pinch.value.x1,
        y1: pinch.value.y1,
        x2: pinch.value.x2,
        y2: pinch.value.y2,
    })

    const middle2 = findMidpoint({
        x1: touch1.clientX,
        y1: touch1.clientY,
        x2: touch2.clientX,
        y2: touch2.clientY,
    })

    x = pinch.value.initialOffsetX + (middle2.x - middle1.x)
    y = pinch.value.initialOffsetY + (middle2.y - middle1.y)

    instance.tools.zoomAndPan.setPosition({ x, y })
})

onInstanceEvent('container:touchend', (data) => {
    if (data.event.touches.length !== 2) return

    isGesturePanning.value = false
})
</script>

<template>
    <div
        v-if="ctrlSpace"
        class="absolute inset-0 z-20 size-full cursor-zoom-in"
        @touchmove.prevent
        @wheel.prevent="onWheel"
        @pointerdown.prevent="onDown"
        @pointermove.prevent="onMove"
        @pointerup.prevent="onUp"
    />
</template>
