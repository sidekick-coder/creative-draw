import type LayerRepository from '@/contracts/LayerRepository'
import type { ListParameters } from '@/contracts/LayerRepository'
import Layer from '@/entities/Layer'
import { createId } from '@/utils/createId'
import Dexie from 'dexie'

export default class LayerRepositoryIndexDB implements LayerRepository {
    constructor(public table: Dexie.Table<Layer, string>) {}

    public async list(params?: ListParameters): Promise<Layer[]> {
        let collection = this.table.toCollection()

        if (params?.projectId) {
            collection = collection.filter((layer) => layer.project_id === params.projectId)
        }

        const items = await collection.toArray()

        return items.map((item) => Layer.fromData(item))
    }

    public async find(id: string): Promise<Layer | null> {
        const layer = await this.table.get(id)

        if (!layer) {
            return null
        }
        return Layer.fromData(layer)
    }

    public async create(data: Partial<Layer>): Promise<Layer> {
        const layer = Layer.fromData(data)

        layer.id = createId()
        layer.created_at = new Date()
        layer.updated_at = new Date()

        await this.table.put(layer)

        return layer
    }

    public async update(id: string, data: Partial<Layer>): Promise<Layer | null> {
        const layer = await this.find(id)

        if (!layer) {
            throw new Error(`Layer with id ${id} not found`)
        }

        Object.assign(layer, data)

        layer.updated_at = new Date()

        await this.table.put(layer)

        return layer
    }

    public async destroy(id: string): Promise<void> {
        const layer = await this.table.get(id)

        if (!layer) {
            throw new Error(`Layer with id ${id} not found`)
        }

        await this.table.delete(id)
    }
}
