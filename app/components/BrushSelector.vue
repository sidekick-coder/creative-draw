<script setup lang="ts">
const brushes = defineProp<Brush[]>('brushes', {
    type: Array,
    default: [],
})

const model = defineModel({
    type: String,
    default: null,
})

const brush = computed(() => brushes.value.find((b) => b.name === model.value))
</script>

<template>
    <cd-menu>
        <template #activator="{ attrs }">
            <cd-btn v-bind="attrs" variant="text" color="none">
                {{ brush?.name || 'Select Brush' }}
            </cd-btn>
        </template>

        <cd-card>
            <cd-list-item v-for="b in brushes" :key="b.name" @click="model = b.name">
                {{ b.name }}
            </cd-list-item>
        </cd-card>
    </cd-menu>
</template>
