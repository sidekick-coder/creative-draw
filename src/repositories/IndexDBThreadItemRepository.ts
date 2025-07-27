import type ThreadItemRepository from '@/contracts/ThreadItemRepository'
import type { ListOptions } from '@/contracts/ThreadItemRepository'
import ThreadItem from '@/entities/ThreadItem'
import { createId } from '@/utils/createId'
import Dexie from 'dexie'

export default class IndexDbThreadItemRepository implements ThreadItemRepository {
    public db: Dexie & {
        thread_items: Dexie.Table<ThreadItem, string>
    }

    constructor(dbName = 'default') {
        this.db = new Dexie(dbName) as Dexie & {
            thread_items: Dexie.Table<ThreadItem, string>
        }

        this.db.version(1).stores({
            thread_items: 'id',
        })
    }

    async list(options: ListOptions = {}): Promise<ThreadItem[]> {
        let collection = this.db.thread_items.toCollection()

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

        const items = await collection.toArray()

        return items.map((item) => ThreadItem.fromData(item))
    }

    async find(id: string): Promise<ThreadItem | null> {
        const item = await this.db.thread_items.get(id)

        if (!item) {
            return null
        }

        return ThreadItem.fromData(item)
    }

    async create(payload: any): Promise<ThreadItem> {
        const item = ThreadItem.fromData(payload)

        item.id = createId()
        item.createdAt = new Date()
        item.updatedAt = new Date()
        item.deletedAt = null

        await this.db.thread_items.put(JSON.parse(JSON.stringify(item)))

        return item
    }

    async update(id: string, payload: any): Promise<ThreadItem | null> {
        const item = await this.db.thread_items.get(id)

        if (!item) {
            throw new Error(`Thread with id ${id} not found`)
        }

        item.data = payload.data
        item.updatedAt = new Date()

        await this.db.thread_items.put(JSON.parse(JSON.stringify(item)))

        return item
    }

    async destroy(id: string): Promise<void> {
        await this.db.thread_items.delete(id)
    }
}
