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
    <cd-card class="min-w-[40rem]">
        <cd-card-content class="flex w-full">
            <div class="flex max-h-[50rem] w-8/12 flex-col gap-y-2 overflow-y-auto">
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
                    <div class="w-full h-5 bg-white rounded-full"></div>
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
