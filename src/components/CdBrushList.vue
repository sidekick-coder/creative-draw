<script setup lang="ts">
const model = defineModel({
    type: String,
})

const categoryId = ref('all')
const brushes = useBrushes()

const categories = ref([
    {
        id: 'all',
        name: 'All',
        brushes: brushes.map((b) => b.id),
    },
])

const category = computed(() => categories.value.find((c) => c.id === categoryId.value))

const visibleBrushes = computed(() => brushes.filter((b) => category.value?.brushes.includes(b.id)))
</script>

<template>
    <cd-card>
        <cd-card-content class="flex flex-col gap-y-4">
            <cd-list-item
                v-for="b in visibleBrushes"
                :key="b.id"
                :active="model === b.id"
                :class="model === b.id ? 'border-primary-500' : 'border-body-300'"
                class="flex flex-col items-start rounded bg-body-800 border-2 p-2"
                @click="model = b.id"
            >
                <div class="font-bold mb-2 text-xs">
                    {{ b.name || b.id }}
                </div>
                <cd-brush-preview :brush="b"></cd-brush-preview>
            </cd-list-item>
        </cd-card-content>
    </cd-card>
</template>
