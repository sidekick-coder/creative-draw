<script setup lang="ts">
const board = useBoard()

const { erase, definitionId, color } = useBrushToolOptions(board)
</script>
<template>
    <cd-btn size="sq-md" :color="erase ? 'primary' : 'body-900'" @click="erase = !erase">
        <cd-icon name="mdi:eraser" />
    </cd-btn>

    <cd-color-picker v-model="color" />
    <cd-menu :close-on-content-click="false">
        <template #activator="{ attrs }">
            <cd-btn v-bind="attrs" size="sq-md" color="body-900">
                <cd-icon name="heroicons:list-bullet" />
            </cd-btn>
        </template>

        <div class="py-2 px-4">
            <cd-brush-list v-model="definitionId" />
        </div>
    </cd-menu>
</template>
