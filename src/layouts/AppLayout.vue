<script setup lang="ts">
import { groupBy } from 'lodash-es'

const links = ref([
    {
        label: __('Home'),
        to: '/',
        icon: 'mdi:home',
        group: __('General'),
    },
    {
        label: __('Projects'),
        to: '/projects',
        icon: 'mdi:folder',
        group: __('General'),
    },
    {
        label: __('Threads'),
        to: '/threads',
        icon: 'mdi:message-text',
        group: __('AI'),
    },
    {
        label: __('Adapters'),
        icon: 'mdi:plugin',
        group: __('AI'),
        to: '/adapters',
    },
])

const groups = computed(() => groupBy(links.value, 'group'))
</script>
<template>
    <div class="flex h-dvh w-dvw">
        <aside class="w-72 bg-body-900 border-r-2 border-body-600">
            <nav class="px-4">
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
                            active-class="bg-body-800 text-body-50"
                        >
                            <cd-icon :name="link.icon" />
                            <span>{{ link.label }}</span>
                        </cd-list-item>
                    </template>
                </template>
            </nav>
        </aside>
        <main class="flex-1">
            <slot />
        </main>
    </div>
</template>
