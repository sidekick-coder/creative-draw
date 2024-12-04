<script setup lang="ts">
import debounce from 'lodash-es/debounce'

const layer = defineModel({
    type: Object as PropType<Layer>,
    required: true,
})

const src = ref<string>()

function toBase64(blob: Blob) {
    return new Promise<string>((resolve) => {
        const reader = new FileReader()

        reader.onload = () => {
            resolve(reader.result as string)
        }

        reader.readAsDataURL(blob)
    })
}

async function load() {
    if (!layer.value.data) {
        return
    }

    const response = await convertUint8ToBlob(
        layer.value.data,
        layer.value.width!,
        layer.value.height!
    )

    const base64 = await toBase64(response)

    if (src.value === base64) {
        return
    }

    src.value = base64
}

let interval: NodeJS.Timeout

onMounted(() => {
    load()

    interval = setInterval(() => load(), 30 * 1000)
})

onUnmounted(() => {
    clearInterval(interval)
})

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
