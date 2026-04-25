import type { WorkspaceGateway } from '@/contracts/WorkspaceGateway'
import Workspace from '@/entities/Workspace'
import type ProjectRepository from '@/contracts/ProjectRepository'
import ProjectRepositoryFilesystem from '@/repositories/ProjectRepositoryFilesystem'
import { createDrive } from 'drive-fsa'
import type LayerRepository from '@/contracts/LayerRepository'
import LayerRepositoryFilesystem from '@/repositories/LayerRepositoryFilesystem'
import type FileRepository from '@/contracts/FileRepository'
import FileRepositoryFilesystem from '@/repositories/FileRepositoryFilesystem'

export default class WorkspaceGatewayFileSystem extends Workspace implements WorkspaceGateway {
    public projects: ProjectRepository
    public layers: LayerRepository
    public files: FileRepository
    public drive: ReturnType<typeof createDrive>
    public handle: FileSystemDirectoryHandle

    constructor(workspace: Workspace) {
        super(workspace)

        const handle = workspace.config.handle as FileSystemDirectoryHandle

        if (!handle) {
            throw new Error('Workspace handle is required')
        }

        this.handle = handle
        this.drive = createDrive(handle)

        this.projects = new ProjectRepositoryFilesystem(this.drive)
        this.layers = new LayerRepositoryFilesystem(this.drive)
        this.files = new FileRepositoryFilesystem(this.drive)
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

        if (!(await this.drive.find('/files'))) {
            await this.drive.mkdir('/files')
        }

        return true
    }
}
