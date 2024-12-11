<script setup lang="ts">
const instance = useInstance()

const size = computed({
    get: () => instance.activeBrush.size,
    set: (value: number) => {
        instance.updateActiveBrush({
            size: value,
        })
    },
})

const opacity = computed({
    get: () => (instance.activeBrush.opacity || 1) * 100,
    set: (value: number) => {
        instance.updateActiveBrush({
            opacity: value / 100,
        })
    },
})

function reset() {
    const brush = instance.brushes.find((brush) => brush.id === instance.activeBrush.id)

    if (!brush) return

    instance.updateActiveBrush({
        size: brush.size,
        opacity: brush.opacity,
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
                    class="text-sm text-body-500 hover:text-body-50"
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
