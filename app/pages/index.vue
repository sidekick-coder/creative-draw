<script setup lang="ts">
// home
</script>

<template>
    <div
        class="flex h-dvh w-dvw flex-col"
        :style="{
            'background-image': 'radial-gradient(rgba(255,255,255, 0.2) 1px, transparent 1px)',
            'background-size': '30px 30px',
        }"
    >
        <div class="flex shrink-0 items-center bg-body-900 px-4 py-3">
            <div class="flex items-center gap-x-4">
                <cd-logo class="size-12 text-primary-300" />
                <span class="font-bold text-body-300">Creative draw</span>
            </div>
            <div class="flex-1"></div>
            <cd-btn
                to="https://github.com/sidekick-coder/creative-draw"
                variant="text"
                target="_blank"
            >
                <cd-icon name="mdi:github" class="mr-2" />
                <span>Github</span>
            </cd-btn>
            <cd-btn to="/gallery"> Open app </cd-btn>
        </div>

        <div class="flex flex-1 flex-col items-center justify-center gap-y-8">
            <cd-logo class="size-40 rounded-full text-primary-300" />
            <div class="text-center">
                <h1 class="mb-2 text-4xl font-bold">Creative draw</h1>
                <h2 class="max-w-lg text-body-100">
                    Free open-source drawing app. Works seamlessly in your browser on desktop and
                    mobile – no installation needed!
                </h2>
            </div>
            <div class="flex flex-col items-center gap-y-2">
                <cd-btn to="/gallery"> Start drawing </cd-btn>
            </div>
        </div>
    </div>
</template>
