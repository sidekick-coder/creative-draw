import type FileRepository from './FileRepository'
import type LayerRepository from './LayerRepository'
import type ProjectRepository from './ProjectRepository'

export interface WorkspaceGateway {
    id: string
    projects: ProjectRepository
    layers: LayerRepository
    files: FileRepository
    load: () => Promise<boolean>
}
