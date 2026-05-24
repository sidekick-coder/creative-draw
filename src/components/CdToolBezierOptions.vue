<script setup lang="ts">
const board = useBoard()

const color = board.context.ref('tools:shared:color', { r: 0, g: 0, b: 0 })
</script>
<template>
    <cd-color-picker v-model="color" />
</template>
