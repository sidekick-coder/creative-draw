<script setup lang="ts">
const board = useBoard()

const { color, constrain } = useEllipseToolOptions(board)
</script>
<template>
    <cd-color-picker v-model="color" />
    <cd-btn size="sq-md" :color="constrain ? 'primary' : 'body-900'" @click="constrain = !constrain">
        <cd-icon name="mdi:aspect-ratio" />
    </cd-btn>
</template>
