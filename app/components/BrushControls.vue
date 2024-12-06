<script setup lang="ts">
const brush = defineProp('brush', {
    type: Object as PropType<BrushSettings>,
    required: true,
})

const model = defineModel({
    type: Object as PropType<BrushSettings>,
    required: true,
})

const size = computed({
    get: () => model.value.size,
    set: (value: number) => {
        model.value.size = value
    },
})

const opacity = computed({
    get: () => model.value.opacity * 100,
    set: (value: number) => {
        model.value.opacity = value / 100
    },
})
</script>

<template>
    <div class="flex flex-col gap-y-2 bg-body-900/80 px-1 py-2">
        <cd-range v-model="size" min="1" max="100" step="1" orientation="vertical" class="h-56" />

        <div></div>

        <cd-range
            v-model="opacity"
            min="0"
            max="100"
            step="1"
            orientation="vertical"
            class="h-56"
        />
    </div>
</template>
