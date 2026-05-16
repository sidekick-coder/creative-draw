import type LayerGroupRepository from '@/contracts/LayerGroupRepository'
import type { ListParameters } from '@/contracts/LayerGroupRepository'
import LayerGroup from '@/entities/LayerGroup'
import { createId } from '@/utils/createId'
import type { createDrive } from 'drive-fsa'

export default class LayerGroupRepositoryFilesystem implements LayerGroupRepository {
    constructor(public drive: ReturnType<typeof createDrive>) {}

    private async readProjectGroups(projectId: string): Promise<LayerGroup[]> {
        const entry = await this.drive.find(`projects/${projectId}/layer-groups.json`)

        if (!entry) {
            return []
        }

        const text = await this.drive.read(`projects/${projectId}/layer-groups.json`, {
            contentType: 'text',
        })

        const json = JSON.parse(text)

        return (json as any[]).map((item) => LayerGroup.fromData(item))
    }

    private async writeProjectGroups(projectId: string, groups: LayerGroup[]): Promise<void> {
        await this.drive.write(`projects/${projectId}/layer-groups.json`, groups as any, {
            contentType: 'json',
        })
    }

    public async list(params?: ListParameters): Promise<LayerGroup[]> {
        if (params?.projectId) {
            return this.readProjectGroups(params.projectId)
        }

        const projectFolders = await this.drive.list('projects')
        const groups: LayerGroup[] = []

        for await (const folder of projectFolders) {
            const projectGroups = await this.readProjectGroups(folder.name)

            groups.push(...projectGroups)
        }

        return groups
    }

    public async find(id: string): Promise<LayerGroup | null> {
        const groups = await this.list()

        return groups.find((g) => g.id === id) ?? null
    }

    public async create(data: Partial<LayerGroup>): Promise<LayerGroup> {
        const group = LayerGroup.fromData(data)

        group.id = createId()
        group.created_at = new Date()
        group.updated_at = new Date()

        const groups = await this.readProjectGroups(group.project_id)

        groups.push(group)

        await this.writeProjectGroups(group.project_id, groups)

        return group
    }

    public async update(id: string, data: Partial<LayerGroup>): Promise<LayerGroup | null> {
        const group = await this.find(id)

        if (!group) {
            throw new Error(`LayerGroup with id ${id} not found`)
        }

        Object.assign(group, data)

        group.updated_at = new Date()

        const groups = await this.readProjectGroups(group.project_id)
        const index = groups.findIndex((g) => g.id === id)

        groups[index] = group

        await this.writeProjectGroups(group.project_id, groups)

        return group
    }

    public async destroy(id: string): Promise<void> {
        const group = await this.find(id)

        if (!group) {
            throw new Error(`LayerGroup with id ${id} not found`)
        }

        const groups = await this.readProjectGroups(group.project_id)
        const filtered = groups.filter((g) => g.id !== id)

        await this.writeProjectGroups(group.project_id, filtered)
    }
}
