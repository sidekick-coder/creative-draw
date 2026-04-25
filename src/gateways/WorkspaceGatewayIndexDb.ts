import type { WorkspaceGateway } from '@/contracts/WorkspaceGateway'
import type Workspace from '@/entities/Workspace'
import Dexie from 'dexie'
import type Project from '@/entities/Project'
import type ProjectRepository from '@/contracts/ProjectRepository'
import type LayerRepository from '@/contracts/LayerRepository'
import Layer from '@/entities/Layer'
import ProjectRepositoryIndexDB from '@/repositories/ProjectRepositoryIndexDB'
import LayerRepositoryIndexDB from '@/repositories/LayerRepositoryIndexDB'

export default class WorkspaceGatewayIndexDB implements WorkspaceGateway {
    public projects: ProjectRepository
    public layers: LayerRepository

    constructor(workspace: Workspace) {
        const db = new Dexie(`workspaces:${workspace.id}`) as Dexie & {
            projects: Dexie.Table<Project, string>
            layers: Dexie.Table<Layer, string>
        }

        db.version(1).stores({
            projects: 'id',
            layers: 'id',
        })

        this.projects = new ProjectRepositoryIndexDB(db.projects)
        this.layers = new LayerRepositoryIndexDB(db.layers)
    }

    public load: WorkspaceGateway['load'] = async () => {
        // no need load
        return true
    }
}
