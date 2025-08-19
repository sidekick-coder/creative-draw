<script setup lang="ts">
const route = useRoute('/workspaces/[workspaceId]')
const router = useRouter()

router.push(`/workspaces/${route.params.workspaceId}/projects`)
</script>
<template>
    <router-view />
</template>
