<script setup lang="ts">
const className = defineProp<string>('class', {
    type: String,
    default: '',
})

const { set, classes } = useClassBuilder(className)

set('base', [
    'flex',
    'items-center',
    'justify-center',
    'w-10',
    'h-10',
    'rounded-full',
    'bg-body-200',
])
</script>
<template>
    <div :class="classes">
        <slot />
    </div>
</template>
