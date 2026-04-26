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
import { ref, onMounted, computed } from 'vue'

const links = defineModel('links', {
    type: Array as PropType<Link[]>,
    default: () => [],
})

defineProps({
    homeUrl: {
        type: String,
        default: '/',
    },
    icon: {
        type: String,
        default: null,
    },
    title: {
        type: String,
        default: null,
    },
    subtitle: {
        type: String,
        default: null,
    },
})

const groups = computed(() => groupBy(links.value, 'group'))

// Sidebar visibility & mobile detection
const sidebarVisible = ref(true)
const isMobile = ref(false)

onMounted(() => {
    const m = window.matchMedia('(max-width: 768px)')
    isMobile.value = m.matches
    if (isMobile.value) sidebarVisible.value = false

    const handle = (e: MediaQueryListEvent) => {
        isMobile.value = e.matches
        if (isMobile.value) sidebarVisible.value = false
    }

    if ('addEventListener' in m) {
        m.addEventListener('change', handle)
    } else {
        // Safari fallback
        // @ts-expect-error Safari fallback
        m.addListener(handle)
    }
})
</script>
<template>
    <div class="flex min-h-dvh">
        <aside v-show="sidebarVisible" class="w-72 bg-body-900">
            <nav class="px-4 flex flex-col h-dvh overflow-auto">
                <slot name="header">
                    <cd-list-item :to="homeUrl" class="py-6 flex items-center">
                        <div
                            v-if="icon"
                            class="px-3 py-2 flex items-center justify-center rounded bg-primary-300 text-body-0 mr-1"
                        >
                            <cd-icon :name="icon" class="size-6" />
                        </div>
                        <cd-logo v-else class="size-8 text-primary-300" />

                        <div class="flex flex-col leading-4 gap-2">
                            <span class="font-bold text-body-50">
                                {{ title || 'Creative Draw' }}
                            </span>
                            <span v-if="subtitle" class="text-body-300 text-xs">
                                {{ subtitle }}
                            </span>
                        </div>
                    </cd-list-item>
                </slot>
                <template v-for="(group, groupName) in groups" :key="groupName">
                    <cd-list-item class="py-1 text-body-200 font-bold text-sm">
                        {{ groupName }}
                    </cd-list-item>

                    <template v-for="link in group" :key="link.to">
                        <cd-list-item
                            :to="link.to"
                            class="py-3 flex items-center gap-x-3 hover:bg-primary-500 rounded-md"
                            exact-active-class="bg-primary-500/25 text-body-0"
                        >
                            <cd-icon :name="link.icon" />
                            <span>{{ link.label }}</span>
                        </cd-list-item>
                    </template>
                </template>
            </nav>
        </aside>
        <main class="flex-1 h-dvh overflow-auto flex flex-col">
            <header class="flex items-center gap-2 px-4 py-3 shrink-0">
                <cd-btn
                    size="sq-md"
                    variant="text"
                    aria-label="Toggle sidebar"
                    @click="sidebarVisible = !sidebarVisible"
                >
                    <cd-icon name="mdi:menu" class="size-5 text-white" />
                </cd-btn>

                <slot name="toolbar" />

                <cd-menu
                    placement="bottom-end"
                    class="bg-body-600 rounded-lg shadow-lg min-w-44 py-1"
                    :offset="4"
                >
                    <template #activator="{ attrs }">
                        <cd-btn
                            v-bind="attrs"
                            size="sq-md"
                            variant="text"
                            color="none"
                            rounded="full"
                            class="ml-auto"
                        >
                            <cd-avatar>
                                <cd-icon name="mdi:account" class="size-5 text-body-0" />
                            </cd-avatar>
                        </cd-btn>
                    </template>

                    <cd-list-item to="/workspaces" class="hover:bg-body-500 rounded-md mx-1">
                        <cd-icon name="mdi:view-grid" class="size-4" />
                        <span>{{ $t('Workspaces') }}</span>
                    </cd-list-item>

                    <cd-list-item to="/" class="hover:bg-body-500 rounded-md mx-1">
                        <cd-icon name="mdi:home" class="size-4" />
                        <span>{{ $t('Landing page') }}</span>
                    </cd-list-item>

                    <cd-list-item
                        to="/legal/privacy-policy"
                        class="hover:bg-body-500 rounded-md mx-1"
                    >
                        <cd-icon name="mdi:shield-lock" class="size-4" />
                        <span>{{ $t('Privacy policy') }}</span>
                    </cd-list-item>

                    <a
                        href="https://github.com/sidekick-coder/creative-draw"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-center gap-x-2 px-4 py-3 hover:bg-body-500 rounded-md mx-1 cursor-pointer"
                    >
                        <cd-icon name="mdi:github" class="size-4" />
                        <span>{{ $t('GitHub') }}</span>
                    </a>
                </cd-menu>
            </header>

            <div class="flex-1 overflow-auto">
                <slot />
            </div>
        </main>
    </div>
</template>
