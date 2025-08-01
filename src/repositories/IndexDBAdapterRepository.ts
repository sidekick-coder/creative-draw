import type AdapterRepository from '@/contracts/AdapterRepository'
import type { ListOptions } from '@/contracts/AdapterRepository'
import Adapter from '@/entities/Adapter'
import { createId } from '@/utils/createId'
import Dexie from 'dexie'

export default class IndexDBAdapterRepository implements AdapterRepository {
    constructor(public table: Dexie.Table<Adapter, string>) {}

    public async list(options: ListOptions = {}): Promise<Adapter[]> {
        let collection = this.table.toCollection()

        collection = collection.filter((item) => {
            if (options.filters?.deleted) {
                return item.deletedAt !== null
            }

            return item.deletedAt === null
        })

        if (options.filters?.id) {
            collection = collection.filter((item) => item.id === options.filters!.id)
        }

        const items = await collection.toArray()

        return items.map((item) => Adapter.fromData(item))
    }

    public async find(id: string): Promise<Adapter | null> {
        const adapter = await this.table.get(id)

        if (!adapter) {
            return null
        }

        return Adapter.fromData(adapter)
    }

    public async create(data: any): Promise<Adapter> {
        const adapter = Adapter.fromData(data)

        adapter.id = createId()
        adapter.createdAt = new Date()
        adapter.updatedAt = new Date()

        await this.table.put(JSON.parse(JSON.stringify(adapter)))

        return adapter
    }

    public async update(id: string, data: any): Promise<Adapter | null> {
        const adapter = await this.table.get(id)

        if (!adapter) {
            throw new Error(`Adapter with id ${id} not found`)
        }

        adapter.name = data.name || adapter.name
        adapter.description = data.description || adapter.description
        adapter.config = data.config || adapter.config
        adapter.updatedAt = new Date()

        await this.table.put(JSON.parse(JSON.stringify(adapter)))

        return adapter
    }

    public async destroy(id: string): Promise<void> {
        const adapter = await this.table.get(id)

        if (!adapter) {
            throw new Error(`Adapter with id ${id} not found`)
        }

        adapter.deletedAt = new Date()

        await this.table.put(JSON.parse(JSON.stringify(adapter)))
    }
}
