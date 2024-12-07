<script setup lang="ts">
const instance = useInstance()

const layers = computed(() => instance.layers.value)
</script>

<template>
    <cd-canvas2 v-for="l in layers" :key="l.id" :layer="l" />
</template>
