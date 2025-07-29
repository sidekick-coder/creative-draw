<script setup lang="ts">
const model = defineModel<string>({
    type: String,
    default: '',
})

const root = ref<HTMLTextAreaElement | null>(null)

function adjustHeight() {
    if (root.value) {
        root.value.style.height = '26px'
        root.value.style.height = `${root.value.scrollHeight}px`
    }
}

watch(model, adjustHeight)
onMounted(adjustHeight)
</script>
<template>
    <textarea
        ref="root"
        v-model="model"
        style="height: 26px"
        class="w-full resize-none focus:outline-none"
    >
    </textarea>
</template>
