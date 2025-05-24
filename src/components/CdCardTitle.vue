<script setup lang="ts">
const className = defineProp<string>('class', {
    type: String,
    default: null,
})

const { set, classes } = useClassBuilder({ class: className })

set('base', 'text-xl font-bold')
</script>
<template>
    <div :class="classes">
        <slot />
    </div>
</template>
