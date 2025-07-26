<script lang="ts">
export interface CdDataTableColumn {
    id: string
    label?: string
    field?: string | ((item: any) => string | number)
}
</script>
<script setup lang="ts" generic="T extends Record<string, any> = any">
defineProps({
    items: {
        type: Array as () => T[],
        default: () => [],
    },
    columns: {
        type: Array as () => CdDataTableColumn[],
        default: () => [],
    },
    total: {
        type: Number,
        default: 0,
    },
    limit: {
        type: Number,
        default: 10,
    },
    page: {
        type: Number,
        default: 1,
    },
})

function getItemKey(index: number, item: any): string {
    return item.id || index
}
</script>
<template>
    <div class="overflow-x-auto w-full">
        <table class="min-w-full divide-y divide-body-600 bg-body-700">
            <thead class="bg-body-800">
                <tr>
                    <th
                        v-for="col in columns"
                        :key="col.id"
                        class="px-4 py-3 text-left text-xs font-medium text-body-50 uppercase tracking-wider"
                    >
                        {{ col.label || col.id }}
                    </th>
                </tr>
            </thead>
            <tbody class="divide-y divide-body-600">
                <tr v-for="(item, index) in items" :key="getItemKey(index, item)">
                    <td
                        v-for="col in columns"
                        :key="col.id"
                        class="px-4 py-2 whitespace-nowrap text-sm"
                    >
                        <span v-if="typeof col.field === 'function'">
                            {{ col.field(item) }}
                        </span>
                        <span v-if="typeof col.field === 'string'">
                            {{ item[col.field] }}
                        </span>
                        <span v-if="!col.field">
                            {{ item[col.id] }}
                        </span>
                    </td>
                </tr>
                <tr v-if="!items.length">
                    <td :colspan="columns.length" class="px-4 py-2 text-center text-gray-400">
                        No data
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
