<script setup>
import brush from './brushes/brush'
import pen from './brushes/pen'

const brushes = ref([pen, brush])
const brushSelected = ref('brush')

const brushSettings = ref({
    color: '#000000',
    size: 50,
})
</script>
<template>
    <div class="flex h-dvh w-dvw flex-col bg-zinc-800 text-white">
        <div class="h-10 w-full bg-zinc-900">
            <button
                v-for="b in brushes"
                :key="b.name"
                class="px-4 py-2"
                :class="b.name === brushSelected ? 'bg-zinc-700' : ''"
                @click="brushSelected = b.name"
            >
                {{ b.name }}
            </button>
        </div>

        <div class="h-[calc(100%-2.5rem)] w-full">
            <cd-canvas :brushes :brush-selected :brush-settings />
        </div>
    </div>
</template>
