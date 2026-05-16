import type Workspace from '@/entities/Workspace'
import type FileRepository from './FileRepository'
import type LayerRepository from './LayerRepository'
import type LayerGroupRepository from './LayerGroupRepository'
import type ProjectRepository from './ProjectRepository'

export interface WorkspaceGateway extends Workspace {
    projects: ProjectRepository
    layers: LayerRepository
    layerGroups: LayerGroupRepository
    files: FileRepository
    load: () => Promise<boolean>
}
