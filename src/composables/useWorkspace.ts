import type { WorkspaceGateway } from '@/contracts/WorkspaceGateway'
import type { InjectionKey } from 'vue'

const key = Symbol('workspace') as InjectionKey<WorkspaceGateway>

export function provideWorkspace(gateway: WorkspaceGateway) {
    provide(key, gateway)
}

export function useWorkspace(): WorkspaceGateway {
    const workspace = inject(key)

    if (!workspace) {
        throw new Error('Workspace not found')
    }

    return workspace
}
