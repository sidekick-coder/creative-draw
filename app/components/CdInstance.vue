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
</script>
<template>
    <div ref="container" class="relative overflow-hidden" @wheel.prevent>
        <slot v-if="!loading" />
    </div>
</template>
