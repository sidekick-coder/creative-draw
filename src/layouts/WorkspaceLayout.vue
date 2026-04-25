<script setup lang="ts">
const route = useRoute('/workspaces/[workspaceId]/projects/')

const workspace = useWorkspace()

const links = ref([
    {
        label: __('Workspaces'),
        to: '/workspaces',
        icon: 'mdi:briefcase',
        group: __('General'),
    },
    {
        label: __('Projects'),
        to: `/workspaces/${route.params.workspaceId}/projects`,
        icon: 'mdi:folder',
        group: __('General'),
    },
    {
        label: __('Storage'),
        to: `/workspaces/${route.params.workspaceId}/files`,
        icon: 'mdi:database',
        group: __('General'),
    },
])
</script>
<template>
    <AppLayout
        :links
        :title="workspace.name"
        :subtitle="workspace.typeLabel"
        :icon="workspace.icon"
    >
        <slot />
    </AppLayout>
</template>
