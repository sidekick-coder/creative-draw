<script setup lang="ts">
// general
const className = defineProp('class', {
    type: String,
    default: '',
})

const { set, classes } = useClassBuilder({
    class: className,
})

set('base', 'cd-range bg-body-800/50')

// model
const model = defineModel({
    type: Number,
})

const max = defineProp<number | string>('max', {
    type: [String, Number],
    default: 100,
})

const min = defineProp<number | string>('min', {
    type: [String, Number],
    default: 0,
})

const step = defineProp<number | string>('step', {
    type: [String, Number],
    default: 1,
})

// orientations
const orientation = defineProp<'horizontal' | 'vertical'>('orientation', {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'horizontal',
})

function setOrientation() {
    const options: Record<string, string> = {
        horizontal: 'w-auto',
        vertical: '[writing-mode:vertical-rl] [direction:rtl] h-auto',
    }

    set('orientation', options[orientation.value] || '')
}

watch(orientation, setOrientation, { immediate: true })

// thumb
const size = defineProp<number>('size', {
    type: String,
    default: '0.8rem',
})
</script>

<template>
    <input
        v-model.number="model"
        :style="{ [orientation]: '100%' }"
        type="range"
        autocomplete="off"
        :min
        :max
        :step
        :class="classes"
    />
</template>

<style lang="scss">
.cd-range {
    -webkit-appearance: none;
    appearance: none;
    outline: none;
    width: v-bind('size');

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        background-color: currentColor;
        width: calc(v-bind('size') * 0.9);
        height: calc(v-bind('size') * 0.9);
        border-radius: 0;
        cursor: pointer;
    }

    &:hover {
        &::-webkit-slider-thumb {
            @apply bg-body-50;
        }
    }
}
</style>
