<script setup lang="ts">
onMounted(async () => {
    const eruda = (await import('eruda')).default

    eruda.init()
})
</script>
<template>
    <div></div>
</template>
