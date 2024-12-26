<script setup lang="ts">
const instance = useInstance()

const model = defineModel({
    type: Object as PropType<ProjectDataLayer>,
    required: true,
})

const zIndex = defineProp<number>('zIndex', {
    type: Number,
    default: 0,
})

const active = defineProp<boolean>('active', {
    type: Boolean,
    default: false,
})

const opacity = computed(() => {
    if (!model.value.visible) {
        return 0
    }

    if (isNaN(model.value.opacity)) {
        return 1
    }

    return model.value.opacity
})

// events
function onPointerEvent(e: PointerEvent) {
    const ctx = canvas.value!.getContext('2d')!

    instance.emit(`layer:${e.type}`, {
        event: e,
        ctx,
        x: e.offsetX,
        y: e.offsetY,
        pressure: e.pressure,
    })
}

function onTouchEvent(e: TouchEvent) {
    const ctx = canvas.value!.getContext('2d')!

    const rect = canvas.value!.getBoundingClientRect()

    const touch = e.touches[0]

    let x = 0
    let y = 0
    let force = 0

    if (touch) {
        x = (touch.clientX - rect.x) * (canvas.value!.width / rect.width)
        y = (touch.clientY - rect.y) * (canvas.value!.height / rect.height)
        force = touch.force
    }

    instance.emit(`layer:${e.type}`, {
        event: e,
        ctx,
        x,
        y,
        pressure: force,
    })
}

function onMouseEvent(e: MouseEvent) {
    const ctx = canvas.value!.getContext('2d')!

    instance.emit(`layer:${e.type}`, {
        event: e,
        ctx,
        x: e.offsetX,
        y: e.offsetY,
    })
}
// canvas
const root = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()

function load() {
    if (!root.value) return

    if (canvas.value) {
        unload()
    }

    canvas.value = model.value.canvas

    root.value.appendChild(canvas.value)

    canvas.value.addEventListener('mousedown', onMouseEvent)
    canvas.value.addEventListener('mousemove', onMouseEvent)
    canvas.value.addEventListener('mouseup', onMouseEvent)
    canvas.value.addEventListener('mouseout', onMouseEvent)

    canvas.value.addEventListener('pointerdown', onPointerEvent)
    canvas.value.addEventListener('pointermove', onPointerEvent)
    canvas.value.addEventListener('pointerup', onPointerEvent)
    canvas.value.addEventListener('pointerout', onPointerEvent)

    canvas.value.addEventListener('touchstart', onTouchEvent)
    canvas.value.addEventListener('touchmove', onTouchEvent)
    canvas.value.addEventListener('touchend', onTouchEvent)
    canvas.value.addEventListener('touchcancel', onTouchEvent)
}

function unload() {
    if (!canvas.value) return

    canvas.value.removeEventListener('mousedown', onMouseEvent)
    canvas.value.removeEventListener('mousemove', onMouseEvent)
    canvas.value.removeEventListener('mouseup', onMouseEvent)
    canvas.value.removeEventListener('mouseout', onMouseEvent)

    canvas.value.removeEventListener('pointerdown', onPointerEvent)
    canvas.value.removeEventListener('pointermove', onPointerEvent)
    canvas.value.removeEventListener('pointerup', onPointerEvent)
    canvas.value.removeEventListener('pointerout', onPointerEvent)

    canvas.value.removeEventListener('touchstart', onTouchEvent)
    canvas.value.removeEventListener('touchmove', onTouchEvent)
    canvas.value.removeEventListener('touchend', onTouchEvent)
    canvas.value.removeEventListener('touchcancel', onTouchEvent)

    canvas.value.remove()
}

watch(() => model.value.canvas, load)
onMounted(load)
onBeforeUnmount(unload)
</script>

<template>
    <div
        ref="root"
        class="absolute left-0 top-0 size-full"
        :style="{
            'opacity': opacity,
            'pointer-events': active ? 'auto' : 'none',
            'z-index': zIndex,
        }"
    ></div>
</template>
