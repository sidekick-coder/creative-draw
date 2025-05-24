<script setup lang="ts">
const instance = useInstance()

function increase() {
    instance.tools.zoomAndPan.setScale(instance.tools.zoomAndPan.scale + 0.1)
}

function decrease() {
    instance.tools.zoomAndPan.setScale(instance.tools.zoomAndPan.scale - 0.1)
}
</script>
<template>
    <cd-btn variant="text" padding="none" size="md" @click="decrease">
        <cd-icon name="mdi:magnify-minus" />
    </cd-btn>
    <cd-btn variant="text" padding="none" size="md" @click="instance.tools.zoomAndPan.fit">
        <cd-icon name="mdi:fit-to-screen" />
    </cd-btn>

    <cd-btn variant="text" padding="none" size="md" @click="increase">
        <cd-icon name="mdi:magnify-plus" />
    </cd-btn>
</template>
