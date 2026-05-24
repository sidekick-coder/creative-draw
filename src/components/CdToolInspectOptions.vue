<script setup lang="ts">
const board = useBoard()

const { formOpen } = useInspectorOptions(board)
</script>
<template>
    <cd-menu v-model="formOpen" :close-on-content-click="false">
        <template #activator="{ attrs }">
            <cd-btn v-bind="attrs" size="sq-md" color="body-900">
                <cd-icon name="mdi:form" />
            </cd-btn>
        </template>
        <div class="py-2 px-4">
            <cd-card class="border-2 border-body-600">
                <cd-object-inspect-form />
            </cd-card>
        </div>
    </cd-menu>

    <cd-menu>
        <template #activator="{ attrs }">
            <cd-btn v-bind="attrs" size="sq-md" color="body-900">
                <cd-icon name="mdi:cube" />
            </cd-btn>
        </template>
        <div class="py-2 px-4">
            <cd-card class="border-2 border-body-600">
                <cd-object-list />
            </cd-card>
        </div>
    </cd-menu>
</template>
