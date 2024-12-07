<script setup lang="ts">
// general
const className = defineProp('class', {
    type: String,
    default: '',
})

const { set, classes } = useClassBuilder({
    class: className,
})

set('base', 'cd-range')

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

const thumb = computed(() => ({
    width: orientation.value === 'vertical' ? size.value : `calc(${size.value})`,
    height: orientation.value === 'horizontal' ? size.value : `calc(${size.value} * 1.1)`,
}))
</script>

<template>
    <input
        v-model.number="model"
        :style="{ [orientation]: '100%' }"
        type="range"
        :min
        :max
        :step
        :class="classes"
    />
</template>

<style lang="scss">
.cd-range {
    @apply bg-body-800/50 rounded;

    -webkit-appearance: none;
    appearance: none;
    outline: none;

    &::-webkit-slider-thumb {
        @apply bg-body-500 transition-colors;

        -webkit-appearance: none;
        appearance: none;
        width: v-bind('thumb.width');
        height: v-bind('thumb.height');
        cursor: pointer;
    }

    &:hover {
        &::-webkit-slider-thumb {
            @apply bg-body-50;
        }
    }
}
</style>
