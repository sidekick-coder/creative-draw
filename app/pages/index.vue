<script setup>
definePageMeta({
    tile: 'Creative draw',
})
</script>

<template>
    <div class="w-dvh flex h-dvh">
        <div class="flex h-full w-10/12 items-center justify-center">
            <div class="flex w-full max-w-sm flex-col justify-center text-center">
                <h1 class="mb-4 text-2xl font-bold">Creative draw</h1>
                <cd-btn to="/project">{{ $t('newEntity', [$t('project')]) }}</cd-btn>
            </div>
        </div>
        <div class="flex w-2/12 flex-col gap-y-8 bg-body-700 p-4">
            <div v-for="i in 3" :key="i">
                <cd-card class="h-32">ads </cd-card>
            </div>
        </div>
    </div>
</template>
