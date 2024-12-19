<script setup lang="ts">
const instance = useInstance()

const active = computed(() => instance.tools.brush.active)

const settings = computed({
    get: () => {
        if (instance.activeTool === 'eraser') {
            return instance.tools.eraser.settings
        }

        return instance.tools.brush.settings
    },
    set: (value) => {
        if (instance.activeTool === 'eraser') {
            return instance.tools.eraser.setSettings(value)
        }

        instance.tools.brush.setSettings(value)
    },
})

const size = computed({
    get: () => settings.value.size || 1,
    set: (value: number) => {
        settings.value.size = value
    },
})

const opacity = computed({
    get: () => (settings.value?.opacity || 1) * 100,
    set: (value: number) => {
        settings.value.opacity = value / 100
    },
})

function reset() {
    if (!active.value) return

    instance.tools.brush.setSettings({
        size: 1,
        opacity: 1,
    })
}
</script>
<template>
    <cd-ui-toolbar class="absolute left-2 top-1/2 -translate-y-1/2">
        <div class="flex flex-col items-center gap-y-2 p-2">
            <cd-range
                v-model="size"
                min="1"
                max="100"
                step="1"
                orientation="vertical"
                class="h-56"
            />

            <div>
                <cd-btn
                    padding="none"
                    variant="text"
                    color="none"
                    class="text-sm text-body-100 hover:text-body-50"
                    @click="reset"
                >
                    <cd-icon name="heroicons:arrow-path" />
                </cd-btn>
            </div>

            <cd-range
                v-model="opacity"
                min="1"
                max="100"
                step="1"
                orientation="vertical"
                class="h-56"
            />
        </div>
    </cd-ui-toolbar>
</template>
