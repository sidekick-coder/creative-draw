<script setup lang="ts">
import { provideWorkspace } from '@/composables/useWorkspace'
import type { WorkspaceGateway } from '@/contracts/WorkspaceGateway'
import WorkspaceRepository from '@/facades/WorkspaceRepository'
import WorkspaceGatewayFilesystem from '@/gateways/WorkspaceGatewayFilesystem'
import WorkspaceGatewayIndexDb from '@/gateways/WorkspaceGatewayIndexDb'

const route = useRoute('/workspaces/[workspaceId]')
const router = useRouter()

const workspace = await WorkspaceRepository.find(route.params.workspaceId)

if (!workspace) {
    throw new Error('Workspace not found')
}

let gateway: WorkspaceGateway | undefined = undefined

if (workspace.type == 'index-db') {
    gateway = new WorkspaceGatewayIndexDb(workspace)
}

if (workspace.type === 'filesystem') {
    gateway = new WorkspaceGatewayFilesystem(workspace)
}

if (!gateway) {
    throw new Error('Error loading workspace')
}

const success = await gateway.load()

if (!success) {
    console.error('Error loading workspace data')

    router.replace('/workspaces')

    throw new Error('Error loading workspace data')
}

provideWorkspace(gateway)
</script>
<template>
    <router-view />
</template>
