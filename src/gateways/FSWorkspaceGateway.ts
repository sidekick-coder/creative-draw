import type { WorkspaceGateway } from '@/contracts/WorkspaceGateway'
import type Workspace from '@/entities/Workspace'
import type ProjectRepository from '@/contracts/ProjectRepository'
import FSProjectRepository from '@/repositories/FSProjectRepository'
import { createDrive } from 'drive-fsa'

export default class FSWorkspaceGateway implements WorkspaceGateway {
    public projects: ProjectRepository
    public drive: ReturnType<typeof createDrive>
    public handle: FileSystemDirectoryHandle

    constructor(workspace: Workspace) {
        const handle = workspace.config.handle as FileSystemDirectoryHandle

        if (!handle) {
            throw new Error('Workspace handle is required')
        }

        this.handle = handle
        this.drive = createDrive(handle)

        this.projects = new FSProjectRepository(this.drive)
    }

    public async load() {
        let isAllowed = (await this.handle.queryPermission({ mode: 'readwrite' })) === 'granted'

        if (!isAllowed) {
            isAllowed = (await this.handle.requestPermission({ mode: 'readwrite' })) === 'granted'
        }

        if (!isAllowed) {
            return false
        }

        if (!(await this.drive.find('/projects'))) {
            await this.drive.mkdir('/projects')
        }

        return true
    }
}
