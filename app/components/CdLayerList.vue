<script setup lang="ts">
const instance = useInstance()

const position = computed(() => instance.tools.zoomAndPan.position)

const width = computed(() => instance.width * instance.tools.zoomAndPan.scale)
const height = computed(() => instance.height * instance.tools.zoomAndPan.scale)

const root = ref<HTMLElement>()

function focus() {
    root.value?.focus()
}
</script>

<template>
    <div
        ref="root"
        class="absolute z-10"
        tabindex="-1"
        :style="{
            width: width + 'px',
            height: height + 'px',
            left: position.x + 'px',
            top: position.y + 'px',
        }"
        @pointerdown="focus"
    >
        <cd-layer-list-item
            v-for="(l, i) in instance.layers"
            :key="l.id"
            :model-value="l"
            class="absolute left-0 top-0"
            :style="{
                'pointer-events': instance.activeLayerId === l.id ? 'auto' : 'none',
                'z-index': instance.layers.length - i,
                'opacity': l.visible ? 1 : 0,
            }"
        />
    </div>
</template>
