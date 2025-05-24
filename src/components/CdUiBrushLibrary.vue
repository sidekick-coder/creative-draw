<script setup lang="ts">
const model = defineModel({
    type: String,
})

const categoryId = ref('all')
const { brushes } = useBrushes()

const categories = ref([
    {
        id: 'all',
        name: 'All',
        brushes: brushes.value.map((b) => b.id),
    },
    {
        id: 'sketching',
        name: 'Sketching',
        brushes: ['pencil-hb', 'pencil-1b', 'pencil-2b', 'pencil-4b', 'pencil-6b'],
    },
])

const category = computed(() => categories.value.find((c) => c.id === categoryId.value))

const visibleBrushes = computed(() =>
    brushes.value.filter((b) => category.value?.brushes.includes(b.id))
)
</script>

<template>
    <cd-card class="min-w-[40rem]">
        <cd-card-head>
            <cd-card-title> Brush Library </cd-card-title>
        </cd-card-head>

        <cd-card-content class="flex w-full">
            <div class="flex max-h-[50rem] w-8/12 flex-col gap-y-1 overflow-y-auto">
                <cd-list-item
                    v-for="b in visibleBrushes"
                    :key="b.id"
                    :active="model === b.id"
                    class="flex flex-col items-start rounded bg-body-800"
                    @click="model = b.id"
                >
                    <div class="font-bold">
                        {{ b.name }}
                    </div>

                    <cd-ui-brush-preview :brush="b"></cd-ui-brush-preview>
                </cd-list-item>
            </div>

            <div class="w-4/12">
                <cd-list-item
                    v-for="(c, i) in categories"
                    :key="i"
                    :active="categoryId === c.id"
                    color="none"
                    class="text-body-100 data-[active=true]:text-body-0"
                    @click="categoryId = c.id"
                >
                    {{ c.name }}
                </cd-list-item>
            </div>
        </cd-card-content>
    </cd-card>
</template>
