<script setup lang="ts">
import { useBrushOptions } from '@/composables/createBrush'

const board = useBoard()

const { color, fill } = useRectOptions(board)
</script>
<template>
    <cd-color-picker v-model="color" />
    <cd-btn size="sq-md" :color="fill ? 'primary' : 'body-900'" @click="fill = !fill">
        <cd-icon name="mdi:square" />
    </cd-btn>
</template>
