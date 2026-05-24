<script setup lang="ts">
const board = useBoard()

const { color } = useEllipseToolOptions(board)
</script>
<template>
    <cd-color-picker v-model="color" />
</template>
