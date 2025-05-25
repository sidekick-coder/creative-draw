<script setup lang="ts">
const width = ref(500)
const height = ref(500)

onMounted(() => {
    width.value = window.innerWidth
    height.value = window.innerHeight
})

const brush = createBrush()
const history = createHistory()
</script>
<template>
    <div>
        <cd-btn @click="history.undo">undo</cd-btn>
        <cd-btn @click="history.redo">redo</cd-btn>
        <cd-btn @click="brush.clear">clear</cd-btn>
        <cd-btn @click="brush.redraw">redraw</cd-btn>

        <board :width :height :plugins="[history]">
            <board-layer :width="500" :height="500" :x="-250" :y="-250" :plugins="[brush]" />
        </board>
    </div>
</template>
