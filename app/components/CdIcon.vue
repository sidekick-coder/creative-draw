<script setup lang="ts">
import { Icon } from '@iconify/vue'

const name = defineProp<string>('name', {
    type: String,
    required: true,
})

const iconName = computed(() => {
    if (name.value.includes(':')) {
        return name.value
    }

    return `heroicons:${name.value}-solid`
})
</script>

<template>
    <Icon :icon="iconName" />
</template>
