<script setup lang="ts">
// general
const className = defineProp<string>('class', {
    type: String,
    default: '',
})

const { set, classes } = useClassBuilder({ class: className })

set('base', 'bg-body-900 rounded transition-opacity z-20')
</script>

<template>
    <div :class="classes">
        <slot />
    </div>
</template>
