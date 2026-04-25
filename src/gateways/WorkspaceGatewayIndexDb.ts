import type { WorkspaceGateway } from '@/contracts/WorkspaceGateway'
import Workspace from '@/entities/Workspace'
import Dexie from 'dexie'
import type Project from '@/entities/Project'
import type ProjectRepository from '@/contracts/ProjectRepository'
import type LayerRepository from '@/contracts/LayerRepository'
import Layer from '@/entities/Layer'
import ProjectRepositoryIndexDB from '@/repositories/ProjectRepositoryIndexDB'
import LayerRepositoryIndexDB from '@/repositories/LayerRepositoryIndexDB'
import type FileRepository from '@/contracts/FileRepository'
import FileRepositoryIndexDB from '@/repositories/FileRepositoryIndexDB'
import type { IndexDbFile } from '@/gateways/IndexDbDriveGateway'

export default class WorkspaceGatewayIndexDB extends Workspace implements WorkspaceGateway {
    public projects: ProjectRepository
    public layers: LayerRepository
    public files: FileRepository

    constructor(workspace: Workspace) {
        super(workspace)

        const db = new Dexie(`workspaces:${workspace.id}`) as Dexie & {
            projects: Dexie.Table<Project, string>
            layers: Dexie.Table<Layer, string>
            files: Dexie.Table<IndexDbFile, string>
        }

        db.version(1).stores({
            projects: 'id',
            layers: 'id',
            files: 'id,filename',
        })

        this.projects = new ProjectRepositoryIndexDB(db.projects)
        this.layers = new LayerRepositoryIndexDB(db.layers)
        this.files = new FileRepositoryIndexDB(db.files)
    }

    public load: WorkspaceGateway['load'] = async () => {
        // no need load
        return true
    }
}
