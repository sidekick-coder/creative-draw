<script setup lang="ts">
import { provideWorkspace } from '@/composables/useWorkspace'
import type { WorkspaceGateway } from '@/contracts/WorkspaceGateway'
import WorkspaceRepository from '@/facades/WorkspaceRepository'
import IndexDbWorkspaceGaeway from '@/gateways/IndexDbWorkspaceGateway'

const route = useRoute('/workspaces/[workspaceId]')

const workspace = await WorkspaceRepository.find(route.params.workspaceId)

if (!workspace) {
    throw new Error('Workspace not found')
}

let gateway: WorkspaceGateway | undefined = undefined

if (workspace?.type == 'index-db') {
    gateway = new IndexDbWorkspaceGaeway(workspace)
}

if (!gateway) {
    throw new Error('Error loading workspace')
}

provideWorkspace(gateway)
</script>
<template>
    <router-view />
</template>
