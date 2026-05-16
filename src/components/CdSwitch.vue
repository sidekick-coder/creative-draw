<script setup lang="ts">
const model = defineModel<boolean>({
    type: Boolean,
    default: false,
})
</script>
<template>
    <button
        role="switch"
        :aria-checked="model"
        class="relative w-10 h-5 rounded-full transition-colors focus:outline-none"
        :class="model ? 'bg-primary-300' : 'bg-body-600'"
        @click="model = !model"
    >
        <span
            class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform"
            :class="model ? 'translate-x-5' : 'translate-x-0'"
        />
    </button>
</template>
