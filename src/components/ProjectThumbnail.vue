<script setup lang="ts">
const project = defineProp<any>('project', {
    type: Object,
    default: () => ({}),
})

const src = computed(() => {
    if (project.value.thumbnail) {
        return project.value.thumbnail
    }

    return null
})
</script>
<template>
    <img v-if="src" :src="src" :alt="project.name" class="object-cover" />
    <div v-else class="flex items-center justify-center bg-body-700">
        <cd-icon name="heroicons:photo-20-solid" class="text-6xl text-body-0" />
    </div>
</template>
