<script setup lang="ts">
const loading = ref(true)
const container = ref<HTMLElement>()
const instance = useInstance()

onMounted(() => {
    instance.setContainer(container.value!)

    loading.value = false
})
</script>
<template>
    <div ref="container" class="relative overflow-hidden">
        <slot v-if="!loading" />
    </div>
</template>
