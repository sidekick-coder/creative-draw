<script setup lang="ts">
const route = useRoute('/workspaces/[workspaceId]/projects/')

const links = ref([
    {
        label: __('Workspaces'),
        to: '/workspaces',
        icon: 'mdi:folder',
        group: __('General'),
    },
    {
        label: __('Projects'),
        to: `/workspaces/${route.params.workspaceId}/projects`,
        icon: 'mdi:folder',
        group: __('General'),
    },
])
</script>
<template>
    <AppLayout :links>
        <slot />
    </AppLayout>
</template>
