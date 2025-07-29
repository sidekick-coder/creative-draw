<script setup lang="ts">
import File from '@/entities/File'
import Drive from '@/facades/Drive'

defineOptions({
    inheritAttrs: false,
})

const emit = defineEmits<{
    (event: 'click', e: MouseEvent): void
}>()

const className = defineProp<string>('class', {
    type: String,
    default: '',
})

const noDialog = defineProp<boolean>('noDialog', {
    type: Boolean,
    default: false,
})

const { set, classes } = useClassBuilder(className)

set('base', ['w-full h-full object-cover rounded-md'])

const dialog = defineModel('dialog', {
    type: Boolean,
    default: false,
})

const src = defineProp<string>('src', {
    type: String,
    required: true,
})

const alt = defineProp<string>('alt', {
    type: String,
    default: '',
})

const innerSrc = ref<string>()

async function load() {
    if (src.value.startsWith('drive:')) {
        const filename = src.value.replace('drive:', '')

        const uint8 = await Drive.read(filename)

        if (uint8) {
            const blob = $uint8.toBlob(uint8, File.mime(filename))
            innerSrc.value = URL.createObjectURL(blob)
        }

        return
    }

    innerSrc.value = src.value
}

function onClick(e: MouseEvent) {
    if (noDialog.value) {
        emit('click', e)
        return
    }

    dialog.value = true
}

watch(src, load, { immediate: true })
</script>
<template>
    <img v-if="innerSrc" :src="innerSrc" :alt="alt" :class="classes" @click="onClick" />

    <cd-dialog v-model="dialog">
        <img
            v-if="innerSrc"
            :src="innerSrc"
            :alt="alt"
            class="w-full h-full max-h-[80dvh] object-cover rounded-md"
        />
    </cd-dialog>
</template>
