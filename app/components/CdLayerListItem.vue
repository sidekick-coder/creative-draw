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
    if (!canvas.value) return

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

onMounted(load)

// render
function render() {
    const ctx = canvas.value!.getContext('2d')!

    const strokes = model.value.points.filter((p) => !p.shape)
    const rects = model.value.points.filter((p) => p.shape === 'rect')

    for (const point of strokes) {
        const { x, y, size, color, opacity } = point
        
        ctx.globalAlpha = opacity
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`

        ctx.beginPath()
        ctx.arc(x, y, size / 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    }


    for (const point of rects) {
        const { x, y, width, height, color, opacity } = point

        ctx.globalAlpha = opacity
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`

        ctx.fillRect(x, y, width, height)
    }
}

onMounted(render)
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
    >
        <canvas ref="canvas" :width="model.width" :height="model.height" />
    </div>
</template>
