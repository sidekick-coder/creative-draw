<script lang="ts">
export interface Link {
    label: string
    to: string
    icon: string
    group: string
}
</script>
<script setup lang="ts">
import { groupBy } from 'lodash-es'

const links = defineModel('links', {
    type: Array as PropType<Link[]>,
    default: () => [],
})

const groups = computed(() => groupBy(links.value, 'group'))
</script>
<template>
    <div class="flex min-h-dvh">
        <aside class="w-72 bg-body-900 border-r-2 border-body-600">
            <nav class="px-4 flex flex-col h-dvh overflow-auto">
                <cd-list-item to="/" class="py-6 flex items-center">
                    <cd-logo class="size-8 text-primary-300" />
                    <span class="font-bold text-body-300">Creative draw</span>
                </cd-list-item>
                <template v-for="(group, groupName) in groups" :key="groupName">
                    <cd-list-item class="py-1 text-body-200 font-bold text-sm">
                        {{ groupName }}
                    </cd-list-item>

                    <template v-for="link in group" :key="link.to">
                        <cd-list-item
                            :to="link.to"
                            class="py-3 flex items-center gap-x-3 hover:bg-body-700 rounded-md"
                            exact-active-class="bg-body-800 text-body-50"
                        >
                            <cd-icon :name="link.icon" />
                            <span>{{ link.label }}</span>
                        </cd-list-item>
                    </template>
                </template>

                <div class="flex items-center mt-auto py-4 text-xs">
                    <cd-list-item to="/legal/privacy-policy" class="flex items-center mt-auto">
                        <span class="font-bold text-body-300">Privacy Policy</span>
                    </cd-list-item>
                    <cd-list-item to="/" class="flex items-center py-2 text-xs">
                        <span class="font-bold text-body-300">Landing page</span>
                    </cd-list-item>
                </div>
            </nav>
        </aside>
        <main class="flex-1 h-dvh overflow-auto">
            <slot />
        </main>
    </div>
</template>
