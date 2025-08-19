import Workspace from '@/entities/Workspace'
import { createId } from '@/utils/createId'
import Dexie from 'dexie'

const db = new Dexie('main') as Dexie & {
    workspaces: Dexie.Table<Workspace, string>
}

db.version(1).stores({
    workspaces: 'id',
})

export default class WorkspaceRepository {
    public async list(): Promise<Workspace[]> {
        const collection = db.workspaces.toCollection()

        const items = await collection.toArray()

        return items.map((item) => Workspace.fromData(item))
    }

    public async find(id: string): Promise<Workspace | null> {
        const workspace = await db.workspaces.get(id)

        if (!workspace) {
            return null
        }

        return Workspace.fromData(workspace)
    }

    public async create(data: any): Promise<Workspace> {
        const workspace = Workspace.fromData(data)

        workspace.id = createId()
        workspace.createdAt = new Date()
        workspace.updatedAt = new Date()

        await db.workspaces.put(workspace)

        return workspace
    }

    public async update(id: string, data: any): Promise<Workspace | null> {
        const workspace = await db.workspaces.get(id)

        if (!workspace) {
            throw new Error(`Workspace with id ${id} not found`)
        }

        workspace.name = data.name || workspace.name
        workspace.description = data.description || workspace.description
        workspace.config = data.config || workspace.config
        workspace.updatedAt = new Date()

        await db.workspaces.put(workspace)

        return workspace
    }

    public async destroy(id: string): Promise<void> {
        const workspace = await db.workspaces.get(id)

        if (!workspace) {
            throw new Error(`Workspace with id ${id} not found`)
        }

        await db.workspaces.delete(id)
    }
}
