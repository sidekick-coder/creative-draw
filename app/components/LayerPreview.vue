<script setup lang="ts">
import debounce from 'lodash-es/debounce'

const layer = defineModel({
    type: Object as PropType<Layer>,
    required: true,
})

const src = ref<string>()

async function load() {
    const response = await convertUint8ToBlob(
        layer.value.data,
        layer.value.width!,
        layer.value.height!
    )

    src.value = URL.createObjectURL(new Blob([response], { type: 'image/png' }))
}

const debouncedLoad = debounce(load, 15 * 1000)

onMounted(load)

watch(() => layer.value.data, debouncedLoad)
// class
const className = defineProp('class', {
    type: String,
    default: '',
})

const { classes, set } = useClassBuilder({
    class: className,
})

set('base', 'h-12 w-16 bg-body-200')
</script>
<template>
    <cd-card :class="classes">
        <img v-if="src" :src="src" class="size-full object-cover" />
    </cd-card>
</template>
