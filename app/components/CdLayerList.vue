<script setup lang="ts">
const instance = useInstance()

const position = computed(() => instance.tools.zoomAndPan.position)
const scale = computed(() => instance.tools.zoomAndPan.scale)

const width = computed(() => instance.width)
const height = computed(() => instance.height)

const x = computed(() => position.value.x)
const y = computed(() => position.value.y)

const root = ref<HTMLElement>()

function focus() {
    root.value?.focus()
}
</script>

<template>
    <div ref="root" class="absolute z-10 size-full" tabindex="-1" :style="{}" @pointerdown="focus">
        <div
            class="absolute"
            :style="{
                'transform': `scale(${scale})`,
                'transform-origin': 'top left',
                'left': `${x}px`,
                'top': `${y}px`,
            }"
        >
            <cd-layer-list-item
                v-for="(l, i) in instance.layers"
                :key="l.id"
                :model-value="l"
                :active="instance.activeLayerId === l.id"
                :width="width"
                :height="height"
                :z-index="instance.layers.length - i"
                class="absolute"
            />
        </div>
    </div>
</template>
