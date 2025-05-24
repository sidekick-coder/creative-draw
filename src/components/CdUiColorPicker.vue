<script setup lang="ts">
const instance = useInstance()

const color = computed({
    get: () => instance.tools.color.color,
    set: (value) => {
        instance.tools.color.color = value
    },
})

const menu = ref(false)
</script>
<template>
    <cd-menu v-model="menu" :close-on-content-click="false">
        <template #activator="{ attrs }">
            <cd-btn v-bind="attrs" variant="text" padding="none" size="md" color="none">
                <div
                    class="size-4 rounded-full outline"
                    :style="{
                        backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`,
                    }"
                ></div>
            </cd-btn>
        </template>

        <div v-if="menu" class="p-2">
            <cd-color-picker v-model="color" />
        </div>
    </cd-menu>
</template>
