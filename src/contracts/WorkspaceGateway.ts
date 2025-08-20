import type LayerRepository from './LayerRepository'
import type ProjectRepository from './ProjectRepository'

export interface WorkspaceGateway {
    projects: ProjectRepository
    layers: LayerRepository
    load: () => Promise<boolean>
}
