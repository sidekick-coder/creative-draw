import type ThreadItemRepository from '@/contracts/ThreadItemRepository'
import type { ListOptions } from '@/contracts/ThreadItemRepository'
import ThreadItem from '@/entities/ThreadItem'
import { createId } from '@/utils/createId'
import Dexie from 'dexie'

export default class IndexDbThreadItemRepository implements ThreadItemRepository {
    constructor(public table: Dexie.Table<ThreadItem, string>) {}

    public async list(options: ListOptions = {}): Promise<ThreadItem[]> {
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

        if (options.filters?.threadId) {
            collection = collection.filter((item) => item.threadId === options.filters!.threadId)
        }

        if (options.limit) {
            collection = collection.limit(options.limit)
        }

        if (options.offset) {
            collection = collection.offset(options.offset)
        }

        const items = await collection.sortBy('createdAt')

        return items.map((item) => ThreadItem.fromData(item))
    }

    public async find(id: string): Promise<ThreadItem | null> {
        const item = await this.table.get(id)

        if (!item) {
            return null
        }

        return ThreadItem.fromData(item)
    }

    public async create(payload: any): Promise<ThreadItem> {
        const item = ThreadItem.fromData(payload)

        item.id = createId()
        item.createdAt = new Date()
        item.updatedAt = new Date()
        item.deletedAt = null

        await this.table.put(JSON.parse(JSON.stringify(item)))

        return item
    }

    public async update(id: string, payload: any): Promise<ThreadItem | null> {
        const item = await this.table.get(id)

        if (!item) {
            throw new Error(`Thread with id ${id} not found`)
        }

        item.data = payload.data
        item.updatedAt = new Date()

        await this.table.put(JSON.parse(JSON.stringify(item)))

        return item
    }

    public async destroy(id: string): Promise<void> {
        await this.table.delete(id)
    }
}
