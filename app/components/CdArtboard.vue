<script setup lang="ts">
const instance = useInstance()

const model = defineModel({
    type: Object as PropType<Artboard>,
    default: () => ({
        id: createId(),
        width: 1920,
        height: 1080,
        x: 0,
        y: 0,
        layers: [],
    }),
})

const x = computed(() => instance.position.x + model.value.x)
const y = computed(() => instance.position.y + model.value.y)
</script>

<template>
    <div
        :id="model.id"
        class="artboard absolute z-10"
        :style="{
            left: x + 'px',
            top: y + 'px',
            width: model.width + 'px',
            height: model.height + 'px',
        }"
    >
        <div class="absolute left-0 top-0 -mt-7">{{ model.name }}</div>

        <cd-artboard-layer
            v-for="l in model.layers"
            :key="l.id"
            :model-value="l"
            :style="{
                'pointer-events': model.activeLayerId === l.id ? 'auto' : 'none',
                'z-index': l.order,
                'opacity': model.visibleLayers.includes(l.id) ? 1 : 0,
            }"
        />
    </div>
</template>
