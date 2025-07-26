<script setup lang="ts">
// label
const className = defineProp<string>('label-class', {
    type: String,
    default: null,
})

const { set, classes } = useClassBuilder({ class: className })

set('base', 'block font-bold text-sm text-body-100 cursor-pointer transition-colors duration-200')
</script>
<template>
    <label :class="classes">
        <slot />
    </label>
</template>
