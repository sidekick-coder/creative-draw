<script setup lang="ts">
import type Project from '@/entities/Project'

const project = defineProp<Project>('project', {
    type: Object,
    default: () => ({}),
})
</script>
<template>
    <img
        v-if="project.thumbnailSrc"
        :src="project.thumbnailSrc"
        :alt="project.name"
        class="object-cover"
    />
    <div v-else class="flex items-center justify-center bg-body-700">
        <cd-icon name="heroicons:photo-20-solid" class="text-6xl text-body-0" />
    </div>
</template>
