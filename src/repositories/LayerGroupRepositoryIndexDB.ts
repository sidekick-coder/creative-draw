import type LayerGroupRepository from '@/contracts/LayerGroupRepository'
import type { ListParameters } from '@/contracts/LayerGroupRepository'
import LayerGroup from '@/entities/LayerGroup'
import { createId } from '@/utils/createId'
import Dexie from 'dexie'

export default class LayerGroupRepositoryIndexDB implements LayerGroupRepository {
    constructor(public table: Dexie.Table<LayerGroup, string>) {}

    public async list(params?: ListParameters): Promise<LayerGroup[]> {
        let collection = this.table.toCollection()

        if (params?.projectId) {
            collection = collection.filter((group) => group.project_id === params.projectId)
        }

        const items = await collection.toArray()

        return items.map((item) => LayerGroup.fromData(item))
    }

    public async find(id: string): Promise<LayerGroup | null> {
        const group = await this.table.get(id)

        if (!group) {
            return null
        }

        return LayerGroup.fromData(group)
    }

    public async create(data: Partial<LayerGroup>): Promise<LayerGroup> {
        const group = LayerGroup.fromData(data)

        group.id = createId()
        group.created_at = new Date()
        group.updated_at = new Date()

        await this.table.put(JSON.parse(JSON.stringify(group)))

        return group
    }

    public async update(id: string, data: Partial<LayerGroup>): Promise<LayerGroup | null> {
        const group = await this.find(id)

        if (!group) {
            throw new Error(`LayerGroup with id ${id} not found`)
        }

        Object.assign(group, data)

        group.updated_at = new Date()

        await this.table.put(JSON.parse(JSON.stringify(group)))

        return group
    }

    public async destroy(id: string): Promise<void> {
        const group = await this.table.get(id)

        if (!group) {
            throw new Error(`LayerGroup with id ${id} not found`)
        }

        await this.table.delete(id)
    }
}
