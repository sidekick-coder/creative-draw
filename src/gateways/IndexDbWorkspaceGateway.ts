import type { WorkspaceGateway } from '@/contracts/WorkspaceGateway'
import type Workspace from '@/entities/Workspace'
import Dexie from 'dexie'
import type Project from '@/entities/Project'
import type ProjectRepository from '@/contracts/ProjectRepository'
import IndexDbProjectRepository from '@/repositories/IndexDbProjectRepository'

export default class IndexDbWorkspaceGateway implements WorkspaceGateway {
    public projects: ProjectRepository

    constructor(workspace: Workspace) {
        const db = new Dexie(`workspaces:${workspace.id}`) as Dexie & {
            projects: Dexie.Table<Project, string>
        }

        db.version(1).stores({
            projects: 'id',
        })

        this.projects = new IndexDbProjectRepository(db.projects)
    }

    public load: WorkspaceGateway['load'] = async () => {
        // no need load
        return true
    }
}
