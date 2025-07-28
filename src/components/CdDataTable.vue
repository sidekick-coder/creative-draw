<script lang="ts">
export interface CdDataTableColumn {
    id: string
    label?: string
    field?: string | ((item: any) => string | number)
    class?: string
}
</script>
<script setup lang="ts" generic="T extends Record<string, any> = any">
import { get } from 'lodash-es'

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
    loading: {
        type: Boolean,
        default: false,
    },
})

function findItemKey(index: number, item: any): string {
    return item.id || index
}

function findItemValue(index: number, item: any, col: CdDataTableColumn): string | number {
    if (typeof col.field === 'function') {
        return col.field(item)
    }

    if (typeof col.field === 'string') {
        return get(item, col.field, '')
    }

    return item[col.id]
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
                        :class="
                            twMerge(
                                'px-4 py-3 text-left text-sm font-bold text-body-50 tracking-wider',
                                col.class
                            )
                        "
                    >
                        {{ col.label }}
                    </th>
                </tr>
                <tr v-if="loading">
                    <th colspan="100%" class="h-1 bg-primary-500 animate-pulse"></th>
                </tr>
            </thead>
            <tbody class="divide-y divide-body-600" :class="loading ? 'opacity-50' : ''">
                <tr v-for="(item, index) in items" :key="findItemKey(index, item)">
                    <td
                        v-for="col in columns"
                        :key="col.id"
                        :class="twMerge('px-4 py-3 whitespace-nowrap text-sm', col.class)"
                    >
                        <slot
                            :name="`item-${col.id}`"
                            :item="item"
                            :index="index"
                            :col="col"
                            :value="findItemValue(index, item, col)"
                        >
                            {{ findItemValue(index, item, col) }}
                        </slot>
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
