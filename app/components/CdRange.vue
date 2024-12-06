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

const max = defineProp<number>('max', {
    type: [String, Number],
    default: 100,
})

const min = defineProp<number>('min', {
    type: [String, Number],
    default: 0,
})

const step = defineProp<number>('step', {
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
        horizontal: '',
        vertical: '[writing-mode:vertical-rl] [direction:rtl]',
    }

    set('orientation', options[orientation.value] || '')
}

watch(orientation, setOrientation, { immediate: true })
</script>

<template>
    <div :class="classes">
        <input
            v-model.number="model"
            :style="{ [orientation]: '100%' }"
            type="range"
            :min
            :max
            :step
        />
    </div>
</template>

<style lang="scss">
.cd-range input {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 100%;
    background: rgb(var(--color-body-800));
    outline: none;

    &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 1rem;
        height: 1rem;
        background: rgb(var(--color-body-100));
        cursor: pointer;
    }
}
</style>
