<script setup lang="ts">
const model = defineModel({
    type: [String, Number] as PropType<string | number>,
})

const valueKey = defineProp<string>('valueKey', {
    type: String,
    default: 'value',
})

const items = defineProp<any[]>('items', {
    type: Array,
    default: () => [],
})

const current = computed(() => {
    const item = items.value.find((item) => item[valueKey.value] === model.value)

    return {
        value: item[valueKey.value],
        label: item.label,
        icon: item.icon,
        color: item.color,
    }
})
</script>

<template>
    <cd-badge :color="current.color" class="flex items-center gap-x-2">
        <div v-if="current.icon">
            <cd-icon :name="current.icon" />
        </div>

        <span>
            {{ current.label }}
        </span>
    </cd-badge>
</template>
