<script setup lang="ts">
const project = defineModel({
    type: Object as PropType<ProjectParsed>,
    required: true,
})

const containerRef = defineProp<HTMLDivElement | null>('containerRef', {
    type: Object,
    default: null,
})

const scale = computed({
    get: () => project.value.current_scale || 1,
    set: (value: number) => {
        project.value.current_scale = value
    },
})

const offsetX = computed({
    get: () => project.value.current_offset_x || 0,
    set: (value: number) => {
        project.value.current_offset_x = value
    },
})

const offsetY = computed({
    get: () => project.value.current_offset_y || 0,
    set: (value: number) => {
        project.value.current_offset_y = value
    },
})

function onZoom(value: number) {
    scale.value = Math.min(Math.max(0.1, scale.value + value), 20)
}

function centralize() {
    if (!containerRef.value || !project.value) return

    const [rects] = containerRef.value.getClientRects()

    if (!rects) return

    const currentWidth = project.value.width * scale.value
    const currentHeight = project.value.height * scale.value

    // centralize the project in the container
    offsetX.value = (rects.width - currentWidth) / 2
    offsetY.value = (rects.height - currentHeight) / 2
}

function fitToScreen() {
    if (!containerRef.value || !project.value) return

    const [rects] = containerRef.value.getClientRects()

    if (!rects) return

    const paddingX = 80
    const paddingY = 80 + 56 // 56 is the height of the top bar

    const availableWidth = rects.width - paddingX * 2
    const availableHeight = rects.height - paddingY * 2

    const scaleWidth = availableWidth / project.value.width
    const scaleHeight = availableHeight / project.value.height

    scale.value = Math.min(scaleWidth, scaleHeight)

    nextTick(centralize)
}

defineExpose({
    fitToScreen,
    onZoom,
})
</script>
<template>
    <cd-card class="w-96" color="body-800">
        <cd-card-head>
            <cd-card-title class="mr-auto text-base">Zoom</cd-card-title>
        </cd-card-head>

        <cd-card-content class="flex gap-x-4">
            <cd-btn padding="none" size="sm" @click="fitToScreen">
                <cd-icon name="heroicons:arrows-pointing-out-20-solid" />
            </cd-btn>

            <cd-btn padding="none" size="sm" @click="onZoom(0.1)">
                <cd-icon name="heroicons:magnifying-glass-plus" />
            </cd-btn>

            <div>
                <span>{{ $number.percentage(scale) }}</span>
            </div>

            <cd-btn padding="none" size="sm" @click="onZoom(-0.1)">
                <cd-icon name="heroicons:magnifying-glass-minus" />
            </cd-btn>
        </cd-card-content>
    </cd-card>
</template>
