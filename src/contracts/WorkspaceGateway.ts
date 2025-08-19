import type ProjectRepository from './ProjectRepository'

export interface WorkspaceGateway {
    projects: ProjectRepository
    load: () => Promise<boolean>
}
