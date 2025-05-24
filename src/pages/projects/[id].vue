<script setup lang="ts">
const width = ref(500)
const height = ref(500)

onMounted(() => {
    width.value = window.innerWidth
    height.value = window.innerHeight
})

const brush = createBrush()
</script>
<template>
    <board :width :height>
        <board-layer :width="500" :height="500" :x="-250" :y="-250" :plugins="[brush]" />
    </board>
</template>
