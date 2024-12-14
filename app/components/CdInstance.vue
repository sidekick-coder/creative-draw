<script setup lang="ts">
const loading = ref(true)
const container = ref<HTMLElement>()
const instance = useInstance()

const height = defineProp<number>('height', {
    type: Number,
    required: true,
})

const width = defineProp<number>('width', {
    type: Number,
    required: true,
})

onMounted(() => {
    instance.load(container.value!, width.value, height.value)

    loading.value = false
})

const size = computed(() => {
    const current = width.value * instance.tools.zoomAndPan.scale

    return Math.ceil(current * 0.03)
})
</script>
<template>
    <div
        ref="container"
        class="relative overflow-hidden"
        :style="{
            'background-size': `${size}px ${size}px`,
            'background-image': `
                linear-gradient(to right, rgb(var(--color-body-500)) 1px, transparent 1px),
                linear-gradient(to bottom, rgb(var(--color-body-500)) 1px, transparent 1px)

            `,
        }"
    >
        <slot v-if="!loading" />
    </div>
</template>
