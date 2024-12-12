<script setup lang="ts">
const instance = useInstance()

const menu = ref(false)

function onClick() {
    if (instance.activeTool === 'brush') {
        menu.value = !menu.value
        return
    }

    instance.setTool('brush')
}
</script>

<template>
    <cd-menu v-model="menu" :close-on-content-click="false" :open-on-click="false">
        <template #activator="{ attrs }">
            <cd-btn
                v-bind="attrs"
                variant="text"
                padding="none"
                size="md"
                :active="instance.activeTool === 'brush'"
                @click="onClick"
            >
                <cd-icon name="heroicons:paint-brush-solid" />
            </cd-btn>
        </template>

        <div class="p-2">
            <cd-ui-brush-library v-model="instance.tools.brush.activeId" />
        </div>
    </cd-menu>
</template>
