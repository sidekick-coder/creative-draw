<script setup lang="ts">
const className = defineProp<string>('class', {
    type: String,
    default: null,
})
</script>
<template>
    <div :class="twMerge('card-footer flex items-center justify-end gap-x-4', className)">
        <slot />
    </div>
</template>
