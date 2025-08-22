<script setup lang="ts">
const route = useRoute('/workspaces/[workspaceId]')
const router = useRouter()

router.replace(`/workspaces/${route.params.workspaceId}/projects`)
</script>
<template>
    <router-view />
</template>
