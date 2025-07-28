<script setup lang="ts">
const className = defineProp<string>('class', {
    type: String,
    default: null,
})

const { set, classes } = useClassBuilder({ class: className })

set('base', 'text-xs text-body-100 md:text-sm')
</script>
<template>
    <div :class="classes">
        <slot />
    </div>
</template>
