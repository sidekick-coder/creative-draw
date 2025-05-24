<script setup lang="ts">
const instance = useInstance()

const menu = ref(false)

function onClick() {
    if (instance.activeTool === 'eraser') {
        menu.value = !menu.value
        return
    }

    instance.setTool('eraser')
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
                :active="instance.activeTool === 'eraser'"
                @click="onClick"
            >
                <cd-icon name="mdi:eraser" />
            </cd-btn>
        </template>

        <div class="p-2">
            <cd-ui-brush-library v-if="menu" v-model="instance.tools.eraser.activeId" />
        </div>
    </cd-menu>
</template>
